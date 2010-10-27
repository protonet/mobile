module System
  class Release
    
    class << self

      def current_version
        @current_version ||= File.readlines("#{RAILS_ROOT}/RELEASE")[0].to_i
      end
      
      def current_type
        @current_type ||= File.readlines("#{RAILS_ROOT}/TYPE")[0]
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
      
      def update!
        return false if Rails.env != 'production'
        if File.exist?("~/deploy")
          system("cd ~/deploy; git pull; bin/deploy -r protonet -e production -m deploy -c #{configatron.shared_file_path}/protonet.d/deploy_config")
        end
      end

    end

  end
end