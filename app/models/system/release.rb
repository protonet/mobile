module System
  class Release
    
    class << self

      def current_version
        @current_version ||= File.readlines("#{RAILS_ROOT}/RELEASE")[0].to_i
      end

      def latest_version
        Net::HTTP.get(URI.parse('http://releases.protonet.info/release/version')).to_i
      end

      def most_recent?
        latest_version == current_version
      end

    end

  end
end