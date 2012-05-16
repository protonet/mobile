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
    
    def last_releases
      release_list = Net::HTTP.get(URI.parse('http://releases.protonet.info/list'))
      release_list.split("<br>").map {|entry| entry.split("|")}
    end

    def most_recent?
      latest_version <= current_version
    end
    
    def password_correct?(password)
      system("export HISTIGNORE=\"*ptn_check_password*\"; #{configatron.current_file_path}/script/ptn_check_password '#{password}'")
    end
    
    def update!(password=nil, release_version=nil)
      return false if Rails.env != 'production'
      return false unless File.exist?("/home/protonet/deployer") && SystemBackend.license_key
      release_version_var = "export RELEASE_VERSION=#{release_version};" unless release_version.blank?
      license_key = SystemBackend.license_key
      babushka_update     = system( "bash", "-c",
        "#{release_version_var} export HISTIGNORE=\"*ptn_babushka_update*\"; #{configatron.current_file_path}/script/ptn_babushka_update #{license_key}"
      )
      babushka_migrations = babushka_update && system( "bash", "-c",
        "export HISTIGNORE=\"*ptn_babushka_migrations*\"; #{configatron.current_file_path}/script/ptn_babushka_migrations '#{password}'"
      )
      deployer_update     = babushka_migrations && system( "bash", "-c",
        "#{release_version_var} export HISTIGNORE=\"*ptn_deployer_update*\"; #{configatron.current_file_path}/script/ptn_deployer_update '#{license_key}'"
      )
      release_update      = deployer_update && system( "bash", "-c",
        "#{release_version_var} #{configatron.current_file_path}/script/ptn_release_update #{configatron.shared_file_path}"
      )
      {:babushka_update => babushka_update, :babushka_migrations => babushka_migrations, :release_update => release_update, :deployer_update => deployer_update}
    end

  end

end