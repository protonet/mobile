require File.join(Rails.root, 'lib', 'rpc', 'base')
require File.join(Rails.root, 'lib', 'rpc', 'client')

class Rpc::Objects::Fs < Rpc::Base
  attr_invokable :list, :move, :copy, :delete, :info, :check_auth

  def initialize
    @client = Rpc::Client.new 'node'
  end

  # List the files in a folder. To non-admins, certain paths (such as '/channels')
  # return results that are not actually based on the actual underlying filesystem.
  def list params, user, &handler
    check_perms [params['parent']], user
    
    @client.call :fs, :list, params do |resp|
      parent = params['parent'].sub(/^\//, "").sub(/\/\$/, "")
      if parent == 'channels'
        allowed_channel_ids = user.allowed_channels.map(&:id)
        
        resp['result'] = resp['result'].find_all do |file|
          return true if file['type'] == 'file'
          allowed_channel_ids.include?(file['name'].to_i)
        end
      end
      
      handler.call resp['error'], resp['result']
    end
  end

  # Move files (doesn't always correspond to raw disk-level moving)
  def move params, user, &handler
    check_perms (params['from'] + [params['to']]), user

    @client.call :fs, :move, params do |resp|
      handler.call resp['error'], resp['result']
    end
  end

  # Copy files (doesn't always correspond to making actual copies)
  def copy params, user, &handler
    check_perms (params['from'] + [params['to']]), user

    @client.call :fs, :copy, params do |resp|
      handler.call resp['error'], resp['result']
    end
  end

  # Delete files
  def delete params, user, &handler
    check_perms params['paths'], user

    @client.call :fs, :delete, params do |resp|
      handler.call resp['error'], resp['result']
    end
  end

  # Create an empty directory. The parent must exist.
  def mkdir params, user, &handler
    check_perms (params['path'] || params['parent']), user

    @client.call :fs, :mkdir, params do |resp|
      handler.call resp['error'], resp['result']
    end
  end

  # Get some info about a list of paths.
  def info params, user, &handler
    check_perms params['paths'], user

    @client.call :fs, :info, params do |resp|
      handler.call resp['error'], resp['result']
    end
  end

  # Checks a user_id and token to ensure that the combination is valid,
  # as well as checking that the user can access the paths.
  def check_auth params, user, &handler
    if !user
      if params.include?('session_id')
        # session_id given
        session = Marshal.load(Base64.decode64(CGI.unescape(params['session_id']).split('--').first))
        params['user_id'] = session["warden.user.user.key"][1][0] rescue nil
        return handler.call nil, false unless user = User.find_by_id(params['user_id'])
      else
        # Find the acclaimed user
        return handler.call nil, false unless user = User.find_by_id(params['user_id'])

        # Verify the communication token
        return handler.call nil, false unless user.communication_token_valid?(params['token'])
      end
    end

    begin
      check_perms params['paths'], user
      handler.call nil, true
    rescue Rpc::RpcError => ex
      handler.call ex, false
    end
  end

  protected
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

    # Check that the user can access everything in an array of paths.
    #
    # Access basically means the user can act on the file in any way, but
    # each command should do some sanity checks.
    #
    # The only access states are forbidden and full access. In the case of a
    # forbidden request, an RpcError is thrown. Hopefully this makes file
    # permissions pretty strong, as a command would have to intentially ignore
    # the permissions check.
    def check_perms paths, user
      if user
        # All hail the admins
        return true if user.admin?
      else
        # TODO: check the share key, if there is one, and if each file is shared
        raise Rpc::AuthError, 'Not authed'
      end
      
      # Accept strings as well
      paths = parse_paths(paths) if paths.first.is_a? String

      # Cache the user's channels
      channels = user.allowed_channels.map(&:id)
      
      paths.each do |(namespace, id, path)|
        # is root path?
        next if namespace.nil? || namespace.empty?
        
        # is "/users" or "/channels"?
        next if id.nil? || id.empty?
        
        # Whitelist of namespaces and what specifies access.
        if namespace == 'users'
          raise Rpc::AccessDeniedError, "Tried accessing a different user's files" unless id.to_i == user.id
        elsif namespace == 'channels'
          raise Rpc::AccessDeniedError, "Not subscribed to channel #{id.to_i}" unless channels.include? id.to_i
        else
          raise Rpc::AccessDeniedError, "Tried accessing unknown file namespace #{namespace}"
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

