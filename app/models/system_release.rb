class SystemRelease
  
  class << self

    def current_version
      @current_version ||= (File.readlines("#{Rails.root}/RELEASE")[0].to_i rescue 0)
    end
    
    def current_type
      @current_type ||= (File.readlines("#{Rails.root}/TYPE")[0] rescue 'STABLE')
    end

    def latest_version
      Net::HTTP.get(URI.parse('http://releases.protonet.info/release/version')).to_i
    end
    
    def latest_beta_version
      Net::HTTP.get(URI.parse('http://releases.protonet.info/beta/version')).to_i
    end

    def most_recent?
      latest_version == current_version
    end
    
    def password_correct?(password)
      system("export HISTIGNORE=\"*ptn_check_password*\"; #{configatron.current_file_path}/script/ptn_check_password '#{password}'")
    end
    
    def update!(password=nil)
      return false if Rails.env != 'production'
      return false unless File.exist?("/home/protonet/deployer") && File.exist?(configatron.deploy_config_file_path)
      license_key = File.read(configatron.deploy_config_file_path).match(/:key, \"(.*)\"/)[1]
      babushka_update     = system("export HISTIGNORE=\"*ptn_babushka_update*\"; #{configatron.current_file_path}/script/ptn_babushka_update #{license_key}")
      babushka_migrations = system("export HISTIGNORE=\"*ptn_babushka_migrations*\"; #{configatron.current_file_path}/script/ptn_babushka_migrations '#{password}'")
      deployer_update     = system("export HISTIGNORE=\"*ptn_deployer_update*\"; #{configatron.current_file_path}/script/ptn_deployer_update '#{license_key}'")
      release_update      = system("#{configatron.current_file_path}/script/ptn_release_update #{configatron.shared_file_path}")
      {:babushka_update => babushka_update, :babushka_migrations => babushka_migrations, :release_update => release_update, :deployer_update => deployer_update}
    end

  end

end