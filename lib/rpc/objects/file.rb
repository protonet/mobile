require 'lib/rpc/base'

class Rpc::Objects::File < Rpc::Base
  attr_invokable :list, :move, :copy, :delete, :info
  
  ROOT_DIR = File.join(::Rails.root, '..', 'shared', 'files')
  USER_DIR = File.join(ROOT_DIR, 'users')
  CHAN_DIR = File.join(ROOT_DIR, 'channels')
  
  # List the files in a folder. To non-admins, certain paths (such as '/channels')
  # return results that are not fully based on the actual underlying filesystem.
  def list params, user
    if user && params['parent'] == 'channels'
      entries = {}
      
      user.channels.verified.each do |chan|
        entries[chan.id.to_s] = {:size => nil, :mime => 'application/x-directory'}
      end
      
      return entries
    end
    
    check_perms [params['parent']], user
    
    entries = {}
    Dir.glob(path_to_fs(params['parent'], '*')	).each do |entry|
      entries[File.basename(entry)] = {
        :size => (File.file?(entry) && File.size(entry)),
        :mime => guess_mime(entry)
      }
    end
    
    entries
  end
  
#  file.list('user/5/folder1/asdf'): filename, mimetype, size, isdisplayable
#      .list('channel'): filename, mimetype, size, isdisplayable
#  
#      .move(['channel/2/asdf.txt', 'channel/2/jkl.txt'], 'channel/2')
#      
#      .copy(['user/2/asdf.txt', 'user/2/jkl.txt'], 'channel/3') - copy a list of files
#      .copy('user/2/asdf.txt',    'channel/3') - make a symlink
#      .copy('channel/2/asdf.txt', 'channel/3') - copy the symlink
#      .copy('channel/2/asdf.txt', 'user/3')    - copy the actual file
#      .copy('user/2/asdf.txt',    'user/3')    - copy the actual file
#      
#      .delete(['list', 'of', 'files', 'or', 'folders'])
#      
#      .info(['user/2/file'])
      
  
  protected
    # Parse a string path into (at most 3) string components. 
    def parse_path path
      parts = path.split(path, 3)
      raise Rpc::RpcError, 'Detected attempt to escape the filesystem' if parts.include? '..'
      parts
    end
    
    # Parse a bunch of paths at once into string components.
    def parse_paths paths
      paths = [paths] unless paths.is_a? Array
      paths.map {|path| parse_path path }
    end
    
    # Check that the user can access everything in an array of paths.
    #
    # Access basically means the user can act on the file in any way, but
    # each command should do some sanity checks.
    #
    # The only access states are forbidden and full access. In the case of a
    # forbidden request, an RpcError is thrown. Hopefully this makes file
    # permissions pretty strong, as a command would have to intentially ignore
    # the permissions check.
    def check_perms paths, user
      if user
        # All hail the admins
        return true if user.admin?
      else
        # TODO: check the share key, if there is one, and if each file is shared
        raise Rpc::AuthError, 'Not authed'
      end
      
      # Accept strings as well
      paths = parse_paths(paths) if paths.first.is_a? String
      
      # Cache the user's channels
      channels = user.channels.verified.map(&:id)
      
      paths.each do |(namespace, id, path)|
        # Non-admins can't escape outside of any object (except for commands that
        # hardcode bypasses, such as file.list('channels') to list all channels)
        # Each command needs to make sure that they still don't do unwanted actions,
        # like a guest deleting the entire namespace or something like that.
        raise Rpc::RpcError, 'Tried escaping from the file tree' unless path
        
        # Whitelist of namespaces and what specifies access.
        if namespace == 'users'
          raise Rpc::RpcError, "Tried accessing a different user's files" unless id.to_i == user.id
        elsif namespace == 'channels'
          raise Rpc::RpcError, "Not subscribed to channel #{id.to_i}" unless channels.include? id.to_i
        else
          raise Rpc::RpcError, "Tried accessing unknown file namespace #{namespace}"
        end 
      end
      
    end
    
    # Resolve a relative or parsed path to the filesystem.
    #
    # Any parameters after the first are included in the File.join call.
    def path_to_fs path, *extra
      if path.is_a? Array
        File.join(ROOT_DIR, *(path + extra))
      else
        File.join(ROOT_DIR, path, *extra)
      end
    end
    
    # Shells out to guess the mime type of a real path. Uses the `file` command.
    # Does no sanity checking, /please/ keep your code secure.
    def guess_mime path
      `file -Lb --mime-type "#{path}"`.strip
    end
end

