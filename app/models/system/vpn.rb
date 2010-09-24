module System
  class Vpn
    
    class << self
      def start
        `/home/protonet/dashboard/current/script/init/vpn /home/protonet/dashboard/current start #{Network.local.uuid} foobar`
      end
    
      def stop
        `/home/protonet/dashboard/current/script/init/vpn /home/protonet/dashboard/current stop`
      end
    
      def status
        system("/home/protonet/dashboard/current/script/init/vpn /home/protonet/dashboard/current status")
      end
    end

  end
end