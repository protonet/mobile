class SystemPublishToWeb
  
  class << self
          
    def publish
      return [false, "doesn't work in non-production environments"] unless Rails.env == 'production'
      monitor_service
      true
    end
    
    def unpublish
      return [false, "doesn't work in non-production environments"] unless Rails.env == 'production'
      SystemMonit.remove(:publish_to_web) if SystemMonit.exists?(:publish_to_web)
      true
    end
    
    def status
      return false unless Rails.env == 'production'
      system(service_command(0, 'status'))
    end
    
    def remote_status
      return false unless Rails.env == 'production'
      open("https://#{SystemPreferences.publish_to_web_name}.protonet.info").status == ['200', 'OK']
    rescue
      false
    end
    
    def ssh_keys
      filename = "#{configatron.shared_file_path}/config/protonet.d/proxy_dsa"
      if SystemPreferences.proxy_ssh_keys && (SystemPreferences.proxy_ssh_keys["private"] == File.read(filename))
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
      response = HTTParty.get(url, :timeout => 10).body
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
      port = self.port
      start = service_command(port, "start")
      stop  = service_command(port, "stop")
      pid_file = "#{configatron.current_file_path}/tmp/pids/publish_to_web.pid"
      SystemMonit.add(:publish_to_web, start, stop, pid_file)
    end
    
    def service_command(port, argument)
      "#{configatron.current_file_path}/script/init/publish_to_web #{port} #{argument}"
    end
    
  end

end