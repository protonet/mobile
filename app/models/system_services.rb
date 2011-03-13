class SystemServices
  def self.services; @services ||= {}; end
  
  def self.add label, entry, config
    services[config[:identifier]] = [label, entry, DaemonController.new(config)]
  end
  
  def self.start_all
    puts '--------------------------'
    puts 'Checking all subsystems...'
    puts

    colored_on  = "\e[1m\e[32m[ UP ]\e[0m"
    colored_off = "\e[1m\e[31m[DOWN]\e[0m"

    # checking the messaging bus
    # TODO: Do something about this!
    fprint 'RabbitMQ:           '
    configatron.messaging_bus_active = SystemMessagingBus.active?
    puts configatron.messaging_bus_active ? colored_on : colored_off
    
    # checking dynamic services
    services.each_value do |(name, entry, klass)|
      fprint((name + ':').ljust(20))
      
      if klass.running?
        configatron.__send__ "#{entry}=", true
        puts colored_on
      else
        fprint "\e[sstarting..." # save cursor
        
        begin
          klass.start
          
          running = klass.running?
          configatron.__send__ "#{entry}=", running
          puts "\e[u\e[K" + (running ? colored_on : colored_off) # restore & clear to end
        rescue DaemonController::StartTimeout
          configatron.__send__ "#{entry}=", false
          puts "\e[u\e[K" + (colored_off) + " Failed to start in time"
        end
      end
    end

    # TODO: Do something about this!
    configatron.ldap.active = false
    puts "LDAP:               #{configatron.ldap.active ? colored_on : colored_off}"
    puts '--------------------------'
  end

  def self.stop_all
    fprint "Shutting down services: \e[s" # save cursor
    
    services.each_value do |(name, entry, klass)|
      fprint "\e[u\e[K#{name}" # restore & clear to end
      
      klass.stop if klass.running?
    end
    
    fprint "\r\e[2K" # Move to left and clear line
  end

  def self.fprint *line # print and flush
    $stdout.print *line
    $stdout.flush
  end
end

SystemServices.add 'Socket server', :js_dispatching_active,
  :identifier    => 'js_dispatching_server',
  :start_command => 'ruby messaging/js_dispatching_control.rb start',
  :stop_command  => 'ruby messaging/js_dispatching_control.rb stop',
  :ping_command  => lambda { TCPSocket.new('localhost', configatron.socket.port) },
  :pid_file      => "tmp/pids/js_dispatcher_#{Rails.env}.pid",
  :log_file      => "tmp/pids/js_dispatcher_#{Rails.env}.output",
  :start_timeout => 60,
  :ping_interval => 5

solr_port = Sunspot.config.solr.url.match(/:(\d+)\//)[1]
SystemServices.add 'Sunspot/Solr', :sunspot_active,
  :identifier    => 'solr_server',
  :start_command => "script/init/sunspot start -p #{solr_port} -s solr --pid-dir=tmp/pids --pid-file=sunspot-solr-#{Rails.env}.pid -d solr/data/#{Rails.env}",
  :stop_command  => "script/init/sunspot stop  -p #{solr_port} -s solr --pid-dir=tmp/pids --pid-file=sunspot-solr-#{Rails.env}.pid -d solr/data/#{Rails.env}",
  :ping_command  => lambda { TCPSocket.new('localhost', solr_port) },
  :pid_file      => "tmp/pids/sunspot-solr-#{Rails.env}.pid",
  :log_file      => "log/sunspot-solr-#{Rails.env}.log",
  :start_timeout => 60

SystemServices.add 'Node.JS', :nodejs_active,
  :identifier    => 'node.js',
  :start_command => "node node/node.js port=#{configatron.nodejs.port}",
  :ping_command  => lambda { TCPSocket.new('localhost', configatron.nodejs.port) },
  :pid_file      => "tmp/pids/node_#{configatron.nodejs.port}.pid",
  :log_file      => 'log/node.log',
  :start_timeout => 45,
  :daemonize_for_me => true
