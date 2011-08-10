require 'json'
require File.dirname(__FILE__) + '/modules/connection_shared.rb'

class HttpConnection < EM::Connection
  include EM::HttpServer
  include Rabbit
  include ConnectionShared

  @response_initialized = false
  def initialize tracker
    super()
    
    @tracker = tracker
    
    close_after_timeout
  end

  def autosubscribe auth_data
    if auth_data && json_authenticate(auth_data)
      @subscribed = true # don't resubscribe
      bind_socket_to_system_queue
      bind_socket_to_user_queues
      add_to_online_users
      send_channel_subscriptions
      refresh_users
      periodical_user_refresh
      
      true
    else
      false
    end
  end

  # def post_init
  #   super
  #   no_environment_strings
  # end

  def send_json json
    json = json.to_json
    @response.send_data "<script>#{json}</script>"
  end

  def process_http_request
    # the http request details are available via the following instance variables:
    #   @http_protocol
    #   @http_request_method
    #   @http_cookie
    #   @http_if_none_match
    #   @http_content_type
    #   @http_path_info
    #   @http_request_uri
    #   @http_query_string
    #   @http_post_content
    #   @http_headers

    # puts "test connection"
    unless @response_initialized
      @response_initialized = true

      # generate http response object but don't close afterwards
      @response = EM::DelegatedHttpResponse.new(self)
      
      # Ensure that every host can acess this via cross domain ajax request in no-production mode
      # We need this for bloody IE who isn't able to do XHR streaming with XMLHttpRequest
      # Instead we abuse XDomainRequest which needs this header:
      @response.headers['Access-Control-Allow-Origin'] = '*';
      @response.content_type 'text/plain'
      @response.xhr_streaming_enable true
      @response.send_response
      
      begin
        @params = JSON.parse(CGI::unescape(@http_query_string || ''))
        if autosubscribe(@params)
          return
        end
      rescue
      end
      
      @response.close_connection
    end
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


