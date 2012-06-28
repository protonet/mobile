module AppManager

  def self.protonet_bindings
    return @protonet_bindings unless @protonet_bindings.blank?
    return [] unless configatron.app_manager.exists?(:apps_path)
    protonet_binding_files = Dir.glob(File.join(configatron.app_manager.apps_path, '**/protonet_binding.yml'))
    @protonet_bindings = protonet_binding_files.map {|protonet_binding_file| AppManager::AppProtonetBinding.new_from_path(protonet_binding_file)}
  end

  def self.find(app_key)
    protonet_bindings.detect { |pb| pb.app_key == app_key }
  end

  class AppProtonetBinding
    class AppKeyNotSpecified < StandardError; end

    attr_accessor :app_name, :link_title, :app_path, :app_key, :app_host, :app_port

    def initialize(configuration)
      configuration.symbolize_keys!
      raise AppKeyNotSpecified if configuration[:app_key].blank?
      self.app_name = configuration[:app_name]
      self.app_key = configuration[:app_key]
      self.link_title = configuration[:link_title]
      self.app_path = configuration[:app_path].blank? ? '/' : configuration[:app_path]
      self.app_host = configuration[:app_host].blank? ? SystemPreferences.public_host.split(':').first : configuration[:app_host]
      self.app_port = configuration[:app_port].blank? ? 80 : configuration[:app_port].to_i
    end

    def self.new_from_path(binding_file_path)
      configuration = YAML.load(File.read(binding_file_path))
      new(configuration)
    end

    def local?
      app_host.blank?
    end

    def app_url
      host_with_port = app_port == 80 ? app_host : "#{app_host}:#{app_port}"
      "http://#{host_with_port}#{app_path}"
    end
  end
  
end