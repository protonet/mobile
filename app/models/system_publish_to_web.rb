class SystemPublishToWeb
  
  class << self
  
    SSL_ROOT_PATH = '/home/protonet/dashboard/shared/config/protonet.d/local.protonet.info'
          
    def publish
      return [false, RuntimeError.new("doesn't work in non-production environments")] unless Rails.env == 'production'
      monitor_service
      SystemPreferences.public_host = "#{SystemPreferences.publish_to_web_name}.protonet.info"
      SystemPreferences.public_host_https = true
      SystemPreferences.publish_to_web = true
      # to handle local dns resolution for the publish to web domain
      `/usr/bin/sudo #{configatron.current_file_path}/script/init/published_host update #{SystemPreferences.public_host}`
      SystemDnsmasq.restart_active
      true
    end
    
    def unpublish
      return [false, RuntimeError.new("doesn't work in non-production environments")] unless Rails.env == 'production'
      SystemMonit.remove(:publish_to_web) if SystemMonit.exists?(:publish_to_web)
      SystemPreferences.public_host = SystemPreferences.defaults[:public_host]
      SystemPreferences.public_host_https = SystemPreferences.defaults[:public_host_https]
      SystemPreferences.publish_to_web = false
      `/usr/bin/sudo #{configatron.current_file_path}/script/init/published_host remove`
      true
    end
    
    def status
      return false unless Rails.env == 'production'
      system(service_command(0, 'status'))
    end
    
    def remote_status
      return false unless Rails.env == 'production'
      timeout(5) do
        open("http://directory.protonet.info/", {"Host" => "#{SystemPreferences.publish_to_web_name}.protonet.info"}).status == ['200', 'OK']
      end  
    rescue Timeout::Error, StandardError
      false
    end
    
    def correct_ssl_cert?      
      subject = `openssl x509 -in #{SSL_ROOT_PATH}.crt -subject -noout`
      if subject.include? 'subject='
        current = subject.match(/CN=([^.]+)\./)[1].to_s
        return SystemPreferences.publish_to_web_name == current
      end
      
      false
    end
    
    def queue_ssl_cert
      return unless Rails.env.production?
      return if correct_ssl_cert?
      
      DelayedJob.create(:command => 'SystemPublishToWeb.plant_ssl_cert')
    end
    
    def check_ssl_set set
      require 'open3'
      crt_modulus = Open3.capture2('openssl x509 -noout -modulus', :stdin_data => set['cert'])[0]
      key_modulus = Open3.capture2('openssl rsa  -noout -modulus', :stdin_data => set['key'])[0]
      
      crt_modulus == key_modulus
    end
    
    def plant_ssl_cert
      return unless Rails.env.production?
      return unless SystemPreferences.set? 'publish_to_web_name'
      return if correct_ssl_cert?
      
      # check for/grab a new cert
      set = get_ssl_cert
      if set && set['cert']
        
        if check_ssl_set(set)
          # there's a cert, so plant it and let's go
          File.write "#{SSL_ROOT_PATH}.crt", set['cert']
          File.write "#{SSL_ROOT_PATH}.key", set['key']
          
          `sudo apache2ctl graceful`
        else
          # Key set is invalid.
          
        end
      else
        # check again in ~15 minutes
        DelayedJob.create(:command => 'SystemPublishToWeb.plant_ssl_cert')
      end
    end
    
    def get_ssl_cert subdomain=nil
      subdomain ||= SystemPreferences.publish_to_web_name
      return nil unless subdomain
      
      SystemPreferences.ssl_certs ||= {
        'local' => {
          'key'  => File.read(SSL_ROOT_PATH + '.key'),
          'cert' => File.read(SSL_ROOT_PATH + '.crt')
        }
      }
      
      info = (SystemPreferences.ssl_certs[subdomain] || create_ssl_csr)
      if !info['cert']
        url = "https://directory.protonet.info/certificate?license_key=#{SystemBackend.license_key}"
        body = {:csr => info['csr'], :name => subdomain}
        response = JSON.parse(HTTParty.post(url, :body => body, :timeout => 30).body)
        info['cert'] = response['cert']
        
        SystemPreferences.ssl_certs = SystemPreferences.ssl_certs.merge({subdomain => info})
      end
      
      if check_ssl_set(info)
        return !info['broken'] && info
      end
      
      Mailer.broken_ssl.deliver unless info['broken']
      info['broken'] = true
      SystemPreferences.ssl_certs = SystemPreferences.ssl_certs.merge({subdomain => info})
      nil
    end
    
    def create_ssl_csr
      path = File.join(Dir.home, ".ssl")
      Dir.mkdir(path, 0700) rescue nil # might already exist
      path = `mktemp -d --tmpdir=#{path}`.strip
      
      `#{configatron.current_file_path}/script/ssl_create_csr #{path} #{SystemPreferences.publish_to_web_name}.protonet.info`
      
      {
        'key' => File.read(File.join(path, 'server.key')),
        'csr' => File.read(File.join(path, 'server.csr'))
      }
    end
    
    def ssh_keys
      filename = "#{configatron.shared_file_path}/config/protonet.d/proxy_dsa"
      if SystemPreferences.proxy_ssh_keys && (SystemPreferences.proxy_ssh_keys["private"] == File.read(filename).strip)
        SystemPreferences.proxy_ssh_keys
      else
        SystemPreferences.proxy_ssh_keys = create_keys
      end
    end
    
    def create_keys
      filename = "#{configatron.shared_file_path}/config/protonet.d/proxy_dsa"
      # cleanup before
      `rm #{filename}*`
      # and generate
      `/usr/bin/ssh-keygen -t dsa -f #{filename} -N ''`
      `/bin/chmod og-rwx #{filename}`
      keys = {"private" => File.read(filename).strip, "public" => File.read(filename + ".pub").strip}
    end
    
    def port
      license_key = SystemBackend.license_key
      url = "http://directory.protonet.info/show?node_name=#{SystemPreferences.publish_to_web_name}&license_key=#{license_key}&public_key_sha=#{Digest::SHA1.hexdigest(ssh_keys["public"])}"
      response = HTTParty.get(url, :timeout => 30).body
      if response.match(/error/)
        register_options = {:node_name => SystemPreferences.publish_to_web_name, :license_key => license_key, :public_key => ssh_keys["public"], :uuid => Network.local.uuid}
        register_url = "http://directory.protonet.info/register"
        register_response = HTTParty.post(register_url, :body => register_options).body
        if register_response.match(/error/)
          raise RuntimeError, register_response
        else
          return JSON.parse(register_response)["port"]
        end
      else
        return response.to_i
      end
    end
    
    def monitor_service
      return if SystemMonit.exists?(:publish_to_web) && SystemMonit.start(:publish_to_web)
      port      = self.port
      start_cmd = service_command(port, "start")
      stop_cmd  = service_command(port, "stop")
      config    = <<-EOS
check host publish_to_web with address directory.protonet.info
   if failed port 80 protocol http
   and request '/empty.html' with hostheader '#{SystemPreferences.publish_to_web_name}.protonet.info'
   with timeout 25 seconds 
   for 1 cycles then restart
   start program = "#{start_cmd}"
   stop program = "#{stop_cmd}"
EOS
      `#{start_cmd}`
      SystemMonit.add_custom(:publish_to_web, config)
    end
    
    def service_command(port, argument)
      "#{configatron.current_file_path}/script/init/publish_to_web #{port} #{argument}"
    end
    
  end

end
