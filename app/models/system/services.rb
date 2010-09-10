module System
  class Services
    # move service stuff from environment.rb to here
    def self.js_dispatcher
      @js_dispatcher ||= DaemonController.new(
         :identifier    => 'js_dispatching_server',
         :start_command => 'ruby messaging/js_dispatching_control.rb start',
         :stop_command  => 'ruby messaging/js_dispatching_control.rb stop',
         :ping_command  => lambda { TCPSocket.new('localhost', configatron.socket.port) },
         :pid_file      => "tmp/pids/js_dispatcher_#{Rails.env}.pid",
         :log_file      => "log/js_dispatcher_#{Rails.env}.output",
         :timeout       => 45
      )
    end
    
    def self.solr
      @solr_port ||= Sunspot.config.solr.url.match(/:(\d+)\//)[1]
      @solr ||= DaemonController.new(
         :identifier    => 'solr_server',
         :start_command => "script/init/sunspot start -p #{@solr_port} -s solr --pid-dir=tmp/pids --pid-file=sunspot-solr-#{Rails.env}.pid -d solr/data/#{Rails.env}",
         :stop_command  => "script/init/sunspot stop  -p #{@solr_port} -s solr --pid-dir=tmp/pids --pid-file=sunspot-solr-#{Rails.env}.pid -d solr/data/#{Rails.env}",
         :ping_command  => lambda { TCPSocket.new('localhost', @solr_port) },
         :pid_file      => "tmp/pids/sunspot-solr-#{Rails.env}.pid",
         :log_file      => "log/sunspot-solr-#{Rails.env}.log",
         :timeout       => 60
      )
    end
    
    def self.node
      @node ||= DaemonController.new(
         :identifier    => 'node.js',
         :start_command => 'node node/node.js',
         :ping_command  => lambda { TCPSocket.new('localhost', 8124) },
         :pid_file      => 'tmp/pids/node.pid',
         :log_file      => 'log/node.log',
         :timeout       => 25,
         :daemonize_for_me => true
      )
    end
    
  end
end