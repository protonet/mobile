module System
  class Vpn
    
    class << self
      def start
        return unless Rails.env == 'production'
        `/home/protonet/dashboard/current/script/init/vpn /home/protonet/dashboard/current start #{Network.local.uuid} foobar`
      end
    
      def stop
        return unless Rails.env == 'production'
        `/home/protonet/dashboard/current/script/init/vpn /home/protonet/dashboard/current stop`
      end
    
      def status
        return 'off' unless Rails.env == 'production'
        system("/home/protonet/dashboard/current/script/init/vpn /home/protonet/dashboard/current status") ? 'on' : 'off'
      end
    end

  end
end