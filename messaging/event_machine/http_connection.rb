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
  end

  def autosubscribe auth_data
    if auth_data && json_authenticate(auth_data)
      @subscribed = true # don't resubscribe
      bind_socket_to_system_queue
      bind_socket_to_user_queues
      add_to_online_users
      send_channel_subscriptions
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
      @response.content_type 'text/html'
      @response.xhr_streaming_enable true
      @response.send_response

      if @http_post_content && autosubscribe(JSON.parse(@http_post_content))
        return
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
end 


