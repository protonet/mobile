module Linux
  class Commands
    class << self

      # Pull network adapter info
      # Options: raw, source, adapter, keys
      # 
      # TODO: specifying raw/source and adapter returns the first adapter info
      def ifconfig options={}
        raw = options[:raw]
        raw = open(options[:source]).read if options.has_key? :source
    
        if options[:adapter]
          raw ||= `ifconfig #{options[:adapter]}` # FIXME: sanitize!
          return nil unless raw.any?
          parse_ifconfig_block raw, options[:keys]
        else
          raw ||= `/sbin/ifconfig -a`
          parse_ifconfig raw, options[:keys]
        end
      end
  
      def parse_ifconfig raw, keys=nil
        ifaces = {}
    
        raw.split("\n\n").each do |raw|
          iface, raw = raw.split(' ', 2)
          ifaces[iface] = parse_ifconfig_block raw, keys
        end
    
        ifaces
      end
  
      def parse_ifconfig_block raw, keys=nil
        data = {}
    
        # The first line is a little strange because the interface name
        # can contain spaces and HWaddr doesn't have a colon.
        # TODO: Use some OOP stuff instead of =~ and $~
        raw =~ /Link encap:(.+?)  (?:HWaddr ([0-9a-fA-F:]+))?/
        data['type'], data['MAC'] = $~.captures
    
        keys ||= ['inet addr', 'inet6 addr', 'RX packets', 'TX packets', 'RX bytes', 'TX bytes']
        keys.each do |key|
          next unless raw.include? key
      
          start = raw.index(key) + key.size + 1 # account for the colon
          space = raw.index(' ', start + 1) - 1 # trim space
          data[key] = raw[start..space].strip
        end
    
        data
      end

    end
  end
end