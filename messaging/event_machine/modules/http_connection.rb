require File.join(File.dirname(__FILE__), 'connection_shared.rb')

class HttpConnection < EM::Connection
  include EM::HttpServer
  include Rabbit
  include ConnectionShared

  def post_init
    super
    custom_post_initialize # from ConnectionShared
    
    @socket_id = nil
  end
  
  @response_initialized = false
  def initialize tracker
    super
    
    @tracker = tracker
    
    close_after_timeout
  end
  
  def unbind
    custom_unbind # from ConnectionShared
  end

  def autosubscribe auth_data
    if auth_data && json_authenticate(auth_data)
      @subscribed = true # don't resubscribe
      bind_socket_to_system_queue
      bind_socket_to_user_queues
      add_to_online_users
      refresh_users
      periodical_user_refresh
      
      true
    else
      false
    end
  end


  def send_json json
    json = json.to_json
    @response.send_data "<script>#{json}</script>"
  end

  def process_http_request
    # the http request details are available via the following instance variables:
    #   @http_protocol, @http_request_method, @http_cookie, @http_if_none_match, @http_content_type, @http_path_info
    #   @http_request_uri, @http_query_string, @http_post_content, @http_headers
    
    @response = EM::DelegatedHttpResponse.new(self)
    
    # Tell the browser to let us POST stuff
    @response.headers['Access-Control-Allow-Origin'] = '*'
    @response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    @response.content_type 'text/plain'

    if @http_request_method == 'GET' && !@response_initialized
      @response_initialized = true
      @socket_id = rand(100000000)

      @response.xhr_streaming_enable true
      @response.send_response
      
      begin
        @params = JSON.parse(CGI::unescape(@http_query_string || ''))
        return if autosubscribe(@params)
      rescue
      end
      
      @response.close_connection
      return
    
    elsif @http_request_method == 'POST'
      @params = JSON.parse(CGI::unescape(@http_query_string || ''))
      
      # {"token"=>"acSdRNUxpCBjQTh5vHQE", "type"=>"web", "user_id"=>1, "socket_id"=>28711967}
      
      @socket = @tracker.open_sockets.find {|socket| socket.socket_id == @params['socket_id'] }
      
      if !@socket || !@socket.user || !@socket.user.communication_token_valid?(@params['token'])
        # Invalid auth
        @response.content = 'Invalid token or socket ID'
        @response.send_response
        
        return
      end
      
      begin
        @socket.receive_json JSON.parse(@http_post_content)
      rescue JSON::ParserError, TypeError
        log "JSON parsing error: #{@http_post_content.inspect}"
      end
      
      # All good
      @response.content = 'Sent.'
      @response.send_response
    end
    
    @response.close_connection_after_writing
  end
  #

  # TODO: redundant code
  def log text
    puts "#{self.class.name}: #{text}" if Rails.env != "production" || $DEBUG
  end
  
  def to_s
    "http connection #{inspect}"
  end
  
  def close_after_timeout
    # this is to ensure that you don't end up with
    # stray request, so we reopen it from the frontend
    EventMachine::add_timer( 120 ) { @response.close_connection rescue nil } # AJ: I added the rescue nil since I was seeing random errors in there
  end
end 


