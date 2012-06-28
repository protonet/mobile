module AppInstaller
  class DependencyPathError < StandardError; end
  class ConfigurationRequirementsNotMet < StandardError; end

  class << self
    attr_accessor :apps, :app_definitions
    def load_apps
      self.app_definitions = YAML.load(File.read(Rails.root.join('config/apps.yml')))
      self.apps = {}
      app_definitions.each_pair do |app_name, configuration|
        self.apps[app_name.to_s] = App.new(app_name, configuration)
      end
      true
    end

    def password_correct?(password)
      system("export HISTIGNORE=\"*ptn_check_password*\"; #{configatron.current_file_path}/script/ptn_check_password '#{password}'")
    end

    def available_apps
      load_apps if apps.nil?
      apps.values
    end

    def app_sources
      []
    end

    def install(params)
      success, message = false, "App installation failed."
      app_name, password , configuration = params[:name], params[:password], params[:configuration]
      if app = find(app_name)
        success, message = true, "App installation successful." if app.install(password, configuration)
      else
        success, message = false, "App not found."
      end
    rescue ConfigurationRequirementsNotMet
      success, message = false, "Configuration Requirements not met."
    ensure
      return {:success => success, :message => message}
    end

    def find(name)
      load_apps if apps.nil?
      apps[name.to_s]
    end

  end

  class App
    attr_accessor :name, :configuration_requirements, :dep_path
    def initialize(name, options={})
      options.symbolize_keys!
      raise AppInstaller::DependencyPathError, 'babushka dep path not specified' if options[:dep_path].blank?
      @name = name
      @configuration_requirements = options.delete(:configuration_requirements) || {}
      @dep_path = options.delete(:dep_path)
      @options = options
    end

    def configuration_requirements= hash
      hash.symbolize_keys!
      @configuration_requirements = hash
    end

    def install(password, configuration)
      if all_configuration_requirements_met?(configuration)
        app_installer_env = configuration.map {|key, value| "APP_INSTALLER_#{key.upcase}='#{value}'"}.join(' ')
        system("export HISTIGNORE=\"*ptn_babushka_app_install*\"; #{app_installer_env} #{configatron.current_file_path}/script/ptn_babushka_app_install '#{dep_path}' #{password}")
      else
        false
      end
    end

    private
    def all_configuration_requirements_met?(configuration)
      @configuration_requirements.keys.each do |configuration_key|
        raise AppInstaller::ConfigurationRequirementsNotMet if configuration[configuration_key].blank?
      end
      true
    end

  end
	
end