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
    
    def initialize
      bind 'rpc', 'requests' do |json|
        p json

        handle_json json
      end
    end
    
    def invoke object, method, params={}
      # Look up the object
      instance = get_object object
      raise NameError, "undefined RPC object '#{object}'" unless instance
      
      # Fetch the method
      raise NoMethodError, "undefined method '#{method}' for RPC object '#{object}'" unless instance.invokable? method
      handler = instance.method method.to_sym

      # Invoke the method
      handler.call(params || {})
    end
    
    protected
      def handle_json json
        result = invoke json['object'], json['method'], json['params']

        # Send the resultant boolean back
        reply json,
          :status => 'success',
          :result => result
        
      rescue => ex
        puts "Error during RPC call: #{ex.class}", ex.message, ex.backtrace
        
        reply json,
          :status => 'error',
          :error => {
            :type => ex.class,
            :message => ex.message}
      end
      
      def reply json, response
        publish 'rpc', 'responses', json.merge(response)
      end
  end
end

