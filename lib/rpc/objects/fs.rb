require File.join(Rails.root, 'lib', 'rpc', 'base')
require File.join(Rails.root, 'lib', 'rpc', 'client')

class Rpc::Objects::Fs < Rpc::Base
  attr_invokable :list, :lastModified, :share, :move, :copy, :remove, :mkdir, :info, :check_auth_and_write_access, :check_auth_and_read_access

  def initialize
    @client = Rpc::Client.new 'node'
  end

  # List the files in a folder. To non-admins, certain paths (such as '/channels')
  # return results that are not actually based on the actual underlying filesystem.
  def list params, user, &handler
    check_read_access [params['parent']], user
    
    @client.call :fs, :list, params do |resp|
      parent = params['parent'].sub(/^\//, "").sub(/\/$/, "")
      
      # /channels/ ?
      if parent == 'channels'
        allowed_channel_ids = user.channels.reload.map(&:id)
        resp['result'] = resp['result'].find_all do |file|
          # replace /users/ with private user folder
          file['type'] == 'file' || allowed_channel_ids.include?(file['name'].to_i)
        end
      end
      
      # root?
      if parent == ''
        resp['result'] = resp['result'].map do |file|
          if file['type'] == "folder" && file['name'] == "users"
            user.stranger? ? nil : { :name => user.id.to_s, :path => "/users/#{user.id}/", :modified => user.created_at, :type => 'folder' }
          elsif file['type'] == "folder" && file['name'] == "system_users"
            nil
          else
            file
          end
        end
        
        resp['result'].compact!
      end
      
      handler.call resp['error'], resp['result']
    end
  end
  
  def lastModified params, user, &handler
    check_read_access [params['parent']], user, true
    
    @client.call :fs, :lastModified, params do |resp|
      handler.call resp['error'], resp['result']
    end
  end
  
  def share params, user, &handler
    check_write_access params['to'], user
    check_read_access  params['from'], user
    
    # select files that can be copied
    params['from'] = select_paths_for_share params['from'], params['to']
    
    return handler.call(nil, {}) if params['from'].empty?
    
    if all_snapshots?(params['from']) && !is_snapshot_folder?(params['to'])
      params['to'] += "snapshots/"
    end
    
    @client.call :fs, :copy, params do |resp|
      handler.call resp['error'], resp['result']
    end
  end
  
  # Move files (doesn't always correspond to raw disk-level moving)
  def move params, user, &handler
    check_write_access params['to'], user
    check_read_access  params['from'], user

    @client.call :fs, :move, params do |resp|
      handler.call resp['error'], resp['result']
    end
  end

  # Copy files (doesn't always correspond to making actual copies)
  def copy params, user, &handler
    check_write_access params['to'], user
    check_read_access  params['from'], user
    
    @client.call :fs, :copy, params do |resp|
      handler.call resp['error'], resp['result']
    end
  end

  # Delete files
  def remove params, user, &handler
    check_write_access params['paths'], user

    @client.call :fs, :remove, params do |resp|
      handler.call resp['error'], resp['result']
    end
  end

  # Create an empty directory. The parent must exist.
  def mkdir params, user, &handler
    check_write_access params['parent'], user

    @client.call :fs, :mkdir, params do |resp|
      handler.call resp['error'], resp['result']
    end
  end

  # Get some info about a list of paths.
  def info params, user, &handler
    check_read_access params['paths'], user

    @client.call :fs, :info, params do |resp|
      handler.call resp['error'], resp['result']
    end
  end

  # Checks a user_id and token to ensure that the combination is valid,
  # as well as checking that the user has read access to the paths.
  
  def check_auth_and_write_access params, user, &handler
    user ||= get_user(params)
    return handler.call nil, false unless user
    
    begin
      check_write_access params['paths'], user
      handler.call nil, true
    rescue Rpc::WriteAccessDeniedError => ex
      handler.call ex, false
    rescue Rpc::AccessDeniedError => ex
      handler.call ex, false
    end
  end
  
  def check_auth_and_read_access params, user, &handler
    user ||= get_user(params)
    return handler.call nil, false unless user
    
    begin
      check_read_access params['paths'], user
      handler.call nil, true
    rescue Rpc::ReadAccessDeniedError => ex
      handler.call ex, false
    rescue Rpc::AccessDeniedError => ex
      handler.call ex, false
    end
  end

  protected
    def get_user params
      if params.include?('session_id')
        # session_id given
        session = Marshal.load(Base64.decode64(CGI.unescape(params['session_id']).split('--').first))
        if session['stranger_id'] && !session['warden.user.user.key']
          user = User.find_by_temporary_identifier(session['stranger_id'])
        else
          params['user_id'] = session["warden.user.user.key"][1][0] rescue nil
          user = User.find_by_id(params['user_id'])
        end
      else
        # or find the acclaimed user and check his the given communication token
        user = User.find_by_id(params['user_id'])
        raise Rpc::AccessDeniedError, "Commiunication token (#{params['token']}) for user id ##{params['user_id']} invalid" if !user || !user.communication_token_valid?(params['token'])
      end
      user
    end
    
    # Parse a string path into (at most 3) string components.
    def parse_path path
      # strip slash at beginning
      path = path.sub(/^\/+/, "")
      # Might be a little overkill but it really works :)
      # Just don't use .. in the client to go up a folder.
      raise Rpc::AccessDeniedError, 'Detected attempt to escape the filesystem' if path.split('/').include? '..'
      path.split('/', 3)
    end

    # Parse a bunch of paths at once into string components.
    def parse_paths paths
      paths = [paths] unless paths.is_a? Array
      paths.map {|path| parse_path path }
    end
    
    # find paths in array that can be copied to the share destination
    def select_paths_for_share from, to
      # Accept strings as well
      to_channel_id = (to.match(/^\/channels\/(\d+)($|\/)/) || [])[1]
      
      from = parse_paths(from) if from.first.is_a? String
      from = from.map do |(namespace, id, path)|
        id = id.to_s
        path = path.to_s
        
        # only copy files when they are potentially inaccessible for some users (/users/1/foo.jpg or /channels/10/abc.mp3)
        next if namespace != "users" && namespace != "channels"
        next if namespace == "channels" && id == to_channel_id # already in that channel
        next if id.empty? || !id.match(/^\d+$/)
        next if path.empty?
        
        "/" + [namespace, id, path].join("/")
      end
      
      from.compact
    end
    
    # Check that the user can access everything in an array of paths.
    #
    # Access basically means the user can act on the file in any way, but
    # each command should do some sanity checks.
    #
    # The only access states are forbidden and full access. In the case of a
    # forbidden request, an RpcError is thrown. Hopefully this makes file
    # permissions pretty strong, as a command would have to intentially ignore
    # the permissions check.
    def check_write_access paths, user
      if user
        return true if user.admin?
      else
        raise Rpc::AuthError, 'Not authed'
      end
      
      raise Rpc::WriteAccessDeniedError, "Strangers are not allowed to write" if user.stranger?
      
      # Accept strings as well
      paths = parse_paths(paths) if paths.first.is_a? String
      
      # Cache the user's channels
      channels = user.channels.reload.map(&:id)
      
      paths.each do |(namespace, id, path)|
        id = id.to_s
        
        next if !id.match(/^\d+$/)
        
        # Whitelist of namespaces and what specifies access.
        if namespace == 'users'
          raise Rpc::WriteAccessDeniedError, "Tried accessing a different user's files" unless id.to_i == user.id
        elsif namespace == 'channels'
          raise Rpc::WriteAccessDeniedError, "Not subscribed to channel #{id.to_i}" unless channels.include? id.to_i
        end
      end
    end
    
    def check_read_access paths, user, include_sub_folders=false
      if user
        return true if user.admin?
      else
        raise Rpc::AuthError, 'Not authed'
      end
      
      # Accept strings as well
      paths = parse_paths(paths) if paths.first.is_a? String
      
      # Cache the user's channels
      channels = user.channels.reload.map(&:id)
      paths.each do |(namespace, id, path)|
        namespace = namespace.to_s
        id = id.to_s
        
        if include_sub_folders
          raise Rpc::ReadAccessDeniedError, "Not allowed" if namespace.empty?
        else
          next if id.empty? || !id.match(/^\d+$/)
        end
        
        if namespace == 'users'
          raise Rpc::ReadAccessDeniedError, "Tried accessing a different user's files" unless id.to_i == user.id
        elsif namespace == 'channels'
          raise Rpc::ReadAccessDeniedError, "Not subscribed to channel #{id.to_i}" unless channels.include? id.to_i
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
    
    def all_snapshots? paths
      paths.all? {|path| is_snapshot_folder?(path) }
    end
    
    def is_snapshot_folder? path
      !!path.match(/^\/users\/\d+\/snapshots\//)
    end
end

