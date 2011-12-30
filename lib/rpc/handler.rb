module Rpc
  class Handler
    include Rabbit

    OBJECT_PATH = File.join(::Rails.root, 'lib', 'rpc', 'objects')

    # Load a list of known objects from the file system. Returns an array of names.
    def known_objects
      objects.keys
    end

    # Load a list of known objects from the file system. Returns a hash.
    def objects
      return @objects if @objects

      @objects = {}
      Dir.glob(File.join(OBJECT_PATH, '*.rb')).each do |path|
        raw_name = File.basename(path, '.rb')
        @objects[raw_name.to_sym] = nil
      end

      @objects
    end

    # Looks up and/or creates an instance of an object.
    def get_object name
      name = name.to_sym
      return nil unless objects.has_key? name

      unless objects[name]
        require File.join(OBJECT_PATH, "#{name}.rb")
        const_name = 'Rpc::Objects::' + ActiveSupport::Inflector.camelize(name)
        objects[name] = ActiveSupport::Inflector.constantize(const_name).new
      end

      objects[name]
    end

    def bind_rabbit
      bind 'rpc', 'requests' do |json|
        p json

        handle_json json
      end
    end

    def invoke object, method, params={}, user=nil, &callback
      params ||= {}

      # Look up the object
      instance = get_object object
      raise NameError, "undefined RPC object '#{object}'" unless instance

      # Fetch the method
      raise NoMethodError, "undefined method '#{method}' for RPC object '#{object}'" unless instance.invokable? method
      handler = instance.method method.to_sym

      # Invoke the method
      result = if handler.arity == 1
        # Can only take at most one param. Ignore any auth.
        handler.call params, &callback
      else
        # Takes additional params. Hand it the current user as well.
        handler.call params, user, &callback
      end

      if result == nil
        callback.call([nil, result])
      end
    end

    protected
      def handle_json json
        invoke json['object'], json['method'], json['params'] do |ex, result|

          if ex
            puts "Error during RPC call: #{ex.class}", ex.message, ex.backtrace

            reply json,
              :status => 'error',
              :error => {
                :type => ex.class,
                :message => ex.message,
                :backtrace => ex.backtrace}
          else
            # Send the results back
            reply json,
              :status => 'success',
              :result => result
          end
        end
      end

      def reply json, response
        response queue
        publish 'rpc', 'responses', json.merge(response)
      end
  end
end

