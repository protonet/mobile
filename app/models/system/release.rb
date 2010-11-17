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
      
      def update!
        return false if Rails.env != 'production'
        if File.exist?("/home/protonet/deploy")
          system("/home/protonet/dashboard/current/script/init/update_release #{configatron.shared_file_path}")
        end
      end

    end

  end
end