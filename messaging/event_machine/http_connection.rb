require 'json'
require File.dirname(__FILE__) + '/modules/connection_shared.rb'

class HttpConnection < EM::Connection
  include EM::HttpServer
  include Rabbit
  include ConnectionShared

  def initialize tracker
    super()
    
    @tracker = tracker
  end
  # def post_init
  #   super
  #   no_environment_strings
  # end

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
    response = EM::DelegatedHttpResponse.new(self)
    response.content_type 'text/html'
    response.xhr_streaming_enable true
    response.send_response
    response.send_data '<script>test</script>'
  end
end 


