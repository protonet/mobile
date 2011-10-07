require 'em-websocket'
require 'json'

class WebsocketConnection < EventMachine::WebSocket::Connection
  include Rabbit
  include ConnectionShared
  
  def initialize(tracker, *args)
    set_comm_inactivity_timeout(60)
    @tracker = tracker
    super({})
  end
  
  # TODO: redundant code
  def log text
    puts "#{self.class.name}: #{text}" if Rails.env != "production" || $DEBUG
  end
  
  def to_s
    "websocket connection #{inspect}"
  end
  
  def trigger_on_open
    custom_post_initialize # from ConnectionShared
  end
  
  def trigger_on_close
    custom_unbind # from ConnectionShared
  end
  
  # websocket specific:
  def trigger_on_message(data)
    receive_json JSON.parse(data)
  rescue JSON::ParserError
    log "JSON parsing error: #{data.inspect}"
  end
  
  def send_json json
    send json.to_json
  end
  
end
