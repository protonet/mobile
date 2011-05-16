class SystemPublishToWeb
  
  class << self
          
    def publish
      monitor_service
    end
    
    def unpublish
      SystemMonit.remove(:publish_to_web) if SystemMonit.exists?(:publish_to_web)
    end
    
    def status
      return false unless Rails.env == 'production'
      system("#{service_command} status")
    end
    
    private
    def ssh_keys
      SystemPreferences.proxy_ssh_keys ||= create_keys
    end
    
    def create_keys
      filename = "#{configatron.shared_file_path}/config/protonet.d/proxy_dsa"
      # cleanup before
      `rm #{filename}*`
      # and generate
      `/usr/bin/ssh-keygen -t dsa -f #{filename} -N ''`
      `/bin/chmod og-rwx #{filename}`
      keys = {"private" => File.read(filename), "public" => File.read(filename + ".pub")}
    end
    
    def port
      license_key = File.read(configatron.deploy_config_file_path).match(/:key, \"(.*)\"/)[1]
      url = "http://directory.protonet.info/show?node_name=#{SystemPreferences.publish_to_web_name}&license_key=#{license_key}"
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
      start = "#{service_command} start"
      stop  = "#{service_command} stop"
      pid_file = "#{configatron.current_file_path}/tmp/pids/publish_to_web.pid"
      SystemMonit.add(:publish_to_web, start, stop, pid_file)
    end
    
    def service_command
      "#{configatron.current_file_path}/script/init/publish_to_web #{port}"
    end
    
  end

end