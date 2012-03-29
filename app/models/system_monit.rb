class SystemMonit
  class AlreadyAddedError  < RuntimeError; end
  class NoSuchServiceError < RuntimeError; end
  
  class << self
    def add(service, start_cmd, stop_cmd, pid_file, options={})
      raise AlreadyAddedError if exists?(service)
      config = <<-EOS
      check process #{service} with pidfile #{pid_file}
        start program = "#{start_cmd}"
        stop program = "#{stop_cmd}"
      EOS
      File.open(service_config_path(service), 'w') {|f| f.write(config) }
      reload!
      monit_command("monitor #{service}")
    end

    def add_custom(service, config)
      raise AlreadyAddedError if exists?(service)
      File.open(service_config_path(service), 'w') {|f| f.write(config) }
      reload!
      monit_command("monitor #{service}")
    end
    
    def remove(service, do_reload = true)
      raise NoSuchServiceError unless exists?(service)
      stop(service)
      sleep 2
      FileUtils.rm(service_config_path(service))
      reload! if do_reload
    end
    
    def start(service)
      monit_command("start #{service}")
    end
    
    def stop(service)
      monit_command("stop #{service}")
    end
    
    def restart(service)
      monit_command("restart #{service}")
    end
    
    def reload!
      monit_command("reload")
    end
  
    # def status(status)
    #   monit_command("status #{service}")
    # end
    
    def exists?(service)
      File.exists?(service_config_path(service))
    end
    
    def service_config_path(service)
      "#{configatron.shared_file_path}/config/monit.d/#{service}"
    end
    
    def monit_command(options=nil)
      system("/usr/sbin/monit -c #{configatron.shared_file_path}/config/monit_ptn_node -p #{configatron.shared_file_path}/pids/monit.pid #{options}")
    end
    
  end

end