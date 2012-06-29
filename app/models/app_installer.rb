module AppInstaller
  class DependencyPathError < StandardError; end
  class ConfigurationRequirementsNotMet < StandardError; end

  class << self
    attr_accessor :apps, :app_definitions
    def load_apps
      self.app_definitions = JSON.parse(File.read(Rails.root.join('config/apps.json')))
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

    def install(params)
      success, message = false, "App installation failed."
      app_name, password , configuration = params[:name], params[:password], params[:configuration]
      if app = find(app_name)
        if app.install(password, configuration)
          success, message = true, "App installation successful."
          InstalledApp.create!(:name => app.name, :install_dep_path => app.dep_path, :uninstall_dep_path => app.uninstall_dep_path)
        end
      else
        success, message = false, "App not found."
      end
    rescue ConfigurationRequirementsNotMet
      success, message = false, "Configuration Requirements not met."
    ensure
      return {:success => success, :message => message}
    end

    def uninstall(app_name, password)
      success, message = false, "App removal failed!"
      if installed_app = InstalledApp.find_by_name(app_name)
        if installed_app.to_app.uninstall(password)
          success, message = true, "App uninstalled successfully." 
          installed_app.destroy
        end
      else
        success, message = false, "App not found."
      end
      {:success => success, :message => message}
    end

    def installed_app_names
      @installed_app_names ||= InstalledApp.all.map(&:name)
    end

    def find(name)
      load_apps if apps.nil?
      apps[name.to_s]
    end

  end

  class App
    attr_accessor :name, :configuration_requirements, :dep_path, :uninstall_dep_path, :homepage, :description
    def initialize(name, options={})
      options.symbolize_keys!
      raise AppInstaller::DependencyPathError, 'babushka dep path not specified' if options[:dep_path].blank?
      raise AppInstaller::DependencyPathError, 'babushka uninstall dep path not specified' if options[:uninstall_dep_path].blank?
      self.name = name
      self.configuration_requirements = options.delete(:configuration_requirements) || {}
      self.homepage = options.delete(:homepage) || ""
      self.description = options.delete(:description) || ""
      self.dep_path = options.delete(:dep_path)
      self.uninstall_dep_path = options.delete(:uninstall_dep_path)
      @options = options
    end

    def configuration_requirements= hash
      hash.symbolize_keys!
      @configuration_requirements = hash
    end

    def install(password, configuration)
      if all_configuration_requirements_met?(configuration)
        app_installer_env = configuration.map {|key, value| "APP_INSTALLER_#{key.upcase}='#{value}'"}.join(' ')
        cmd = "export HISTIGNORE=\"*ptn_babushka_app_install*\"; #{app_installer_env} #{configatron.current_file_path}/script/ptn_babushka_app_install '#{dep_path}' #{password}"
        if stub_system_calls?
          Rails.logger.debug(cmd)
          true
        else
          system(cmd)
        end
      else
        false
      end
    end

    def uninstall(password)
      cmd = "export HISTIGNORE=\"*ptn_babushka_app_install*\"; #{configatron.current_file_path}/script/ptn_babushka_app_install '#{uninstall_dep_path}' #{password}"
      if stub_system_calls?
        Rails.logger.debug(cmd)
        true
      else
        system(cmd)
      end
    end

    def installed?
      ::AppInstaller.installed_app_names.include?(name)
    end

    private
    def all_configuration_requirements_met?(configuration)
      @configuration_requirements.keys.each do |configuration_key|
        raise AppInstaller::ConfigurationRequirementsNotMet if configuration[configuration_key].blank?
      end
      true
    end

    def stub_system_calls?
      configatron.app_installer.exists?(:stub_system_calls) && !!configatron.app_installer.stub_system_calls
    end

  end
	
end