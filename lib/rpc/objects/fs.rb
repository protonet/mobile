require 'lib/rpc/base'
require 'lib/rpc/client'

class Rpc::Objects::Fs < Rpc::Base
  attr_invokable :list, :move, :copy, :delete, :info

  def initialize
    @client = Rpc::Client.new 'node'
  end

  # List the files in a folder. To non-admins, certain paths (such as '/channels')
  # return results that are not actually based on the actual underlying filesystem.
  def list params, user, &handler
    if user && !user.admin? && params['parent'] == 'channels'
      entries = {}

      user.channels.verified.each do |chan|
        entries[chan.id.to_s] = {:type => 'folder'}
      end

      return entries
    end

    check_perms [params['parent']], user

    @client.call :fs, :list, params do |resp|
      handler.call resp['result']
    end
  end

  # Move files (doesn't always correspond to raw disk-level moving)
  def move params, user, &handler
    check_perms (params['from'] + [params['to']]), user

    @client.call :fs, :move, params do |resp|
      handler.call resp['result']
    end
  end

  # Copy files (doesn't always correspond to making actual copies)
  def copy params, user, &handler
    check_perms (params['from'] + [params['to']]), user

    @client.call :fs, :copy, params do |resp|
      handler.call resp['result']
    end
  end

  # Delete files
  def delete params, user, &handler
    check_perms params['paths'], user

    @client.call :fs, :delete, params do |resp|
      handler.call resp['result']
    end
  end

  # Create an empty directory. The parent must exist.
  def mkdir params, user, &handler
    check_perms (params['path'] || params['parent']), user

    @client.call :fs, :mkdir, params do |resp|
      handler.call resp['result']
    end
  end

  protected
    # Parse a string path into (at most 3) string components.
    def parse_path path
      # Might be a little overkill but it really works :)
      # Just don't use .. in the client to go up a folder.
      raise Rpc::RpcError, 'Detected attempt to escape the filesystem' if parth.split('/').include? '..'
      path.split('/', 3)
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
      paths = parse_paths(paths) if paths.first.is_a? String

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
end

