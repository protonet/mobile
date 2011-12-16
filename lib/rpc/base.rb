module Rpc
  module Objects; end
  
  class Base
    # Marks methods as invokable via an RPC interface. Works like attr_accessible.
    # If not called, all newly-defined methods are allowed to be invoked.
    def self.attr_invokable *names
      names = names.flatten.map(&:to_sym)
      @invokable ||= []
      @invokable |= names
    end
    
    # Checks if a method is make invokable. If attr_invokable was used, then this
    # checks agains the whitelist. Otherwise, any custom method provided by the
    # object is allowed.
    def self.invokable? name
      list = @invokable
      list ||= (self.public_instance_methods - Rpc::Base.public_instance_methods).map(&:to_sym)
      
      list.include?(name.to_sym)
    end
    
    # Checks if a method is make invokable. See the class version.
    def invokable? name
      self.class.invokable? name
    end
  end
end

