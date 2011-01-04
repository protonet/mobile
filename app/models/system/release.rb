module System
  class Release
    
    class << self

      def current_version
        @current_version ||= (File.readlines("#{RAILS_ROOT}/RELEASE")[0].to_i rescue 0)
      end
      
      def current_type
        @current_type ||= (File.readlines("#{RAILS_ROOT}/TYPE")[0] rescue 'STABLE')
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
      
      def update!(password=nil)
        return false if Rails.env != 'production'
        license_key = "FIXME"
        if File.exist?("/home/protonet/deploy")
          babushka_update     = system("export HISTIGNORE=\"*ptn_babushka_update*\"; /home/protonet/dashboard/current/script/ptn_babushka_update #{license_key}")
          babushka_migrations = system("export HISTIGNORE=\"*ptn_babushka_migrations*\"; /home/protonet/dashboard/current/script/ptn_babushka_migrations #{password}")
          release_update      = system("/home/protonet/dashboard/current/script/ptn_release_update #{configatron.shared_file_path}")
        end
      end

    end

  end
end