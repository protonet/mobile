class App < ActiveRecord::Base
  class AppInstallationFailed < StandardError; end
  class ConfigurationRequirementsNotMet < StandardError; end
  class AppRemovalFailed < StandardError; end

  has_many :app_dashboard_bindings, :dependent => :destroy, :autosave => true
  attr_accessor :configuration_requirements, :dashboard_bindings

  validates :key, :presence => true
  validates :install_dep_path, :presence => true
  validates :uninstall_dep_path, :presence => true
  validates :display_name, :presence => true

  after_initialize do
    self.dashboard_bindings = [] if self.dashboard_bindings.nil?
  end

  class << self

    def available_apps
      return @apps.values unless @apps.blank?
      refresh_app_index
      @apps.values
    end

    def installed_apps
      all
    end

    def install(params)
      app_key, password, configuration = params[:key], params[:password], params[:configuration]
      refresh_app_index
      app = @apps[app_key]
      if app
        app.install(password, configuration)
      else
        raise ActiveRecord::RecordNotFound.new('App Definition not found.')
      end
    end

    def uninstall(params)
      app_key, password = params[:key], params[:password]
      if app = App.find_by_key(app_key)
        app.uninstall(password)
      else
        raise ActiveRecord::RecordNotFound
      end
    end

    private
    def refresh_app_index
      @apps = {}
      app_definitions = JSON.parse(File.read(Rails.root.join('config/apps.json')))
      app_definitions.each_pair do |app_key, configuration|
        @apps[app_key.to_s] = find_or_initialize_by_key(app_key, configuration)
      end
    end

  end

  def installed?
    persisted?
  end

  def install(password, configuration={})
    validate_app_definition!
    if all_configuration_requirements_met?(configuration)
      app_installer_env = configuration.map {|key, value| "APP_INSTALLER_#{key.upcase}='#{value}'"}.join(' ')
      cmd = "export HISTIGNORE=\"*ptn_babushka_app_install*\"; #{app_installer_env} #{configatron.current_file_path}/script/ptn_babushka_app_install '#{install_dep_path}' #{password}"
      if stub_system_calls?
        Rails.logger.debug(cmd)
        build_dashboard_bindings
        self.save!
      else
        if system(cmd)
          build_dashboard_bindings
          self.save!
        else
          raise AppInstallationFailed
        end
      end
    else
      raise ConfigurationRequirementsNotMet
    end    
  end

  def uninstall(password)
    cmd = "export HISTIGNORE=\"*ptn_babushka_app_install*\"; #{configatron.current_file_path}/script/ptn_babushka_app_install '#{uninstall_dep_path}' #{password}"
    if stub_system_calls?
      Rails.logger.debug(cmd)
      self.destroy
    else
      if system(cmd)
        self.destroy
      else
        raise AppRemovalFailed
      end
    end
  end

  def validate_app_definition!
    raise AppDefinitionNotValid unless self.valid?
  end

  private
  def all_configuration_requirements_met?(configuration)
    self.configuration_requirements.keys.each do |configuration_key|
      raise ConfigurationRequirementsNotMet if configuration[configuration_key].blank?
    end
  end

  def stub_system_calls?
    configatron.app_installer.exists?(:stub_system_calls) && !!configatron.app_installer.stub_system_calls
  end

  def build_dashboard_bindings
    self.dashboard_bindings.each do |db|
      self.app_dashboard_bindings.build(db)
    end
  end



end
