require File.join(File.dirname(__FILE__), '..', 'flash_connection')

# this is the class to handle policy talk with flash sockets
class FlashServer < FlashConnection
  @policy_sent = false
  
  def receive_data data
    unless @policy_sent
      @policy_sent = true
      
      if data[0, data.index("\0")] == '<policy-file-request/>'
        send_swf_policy
        data = data[(data.index("\0")+1)..-1]
      end
    end
    
    super(data)
  end
  
  # this is a flash security policy thing that needs to be sent on
  # the first request to the server
  def send_swf_policy
    log "sending policy"
    
    policy = <<-EOS
    <?xml version="1.0" encoding="UTF-8"?> 
    <cross-domain-policy xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.adobe.com/xml/schemas/PolicyFileSocket.xsd">
        <allow-access-from domain="*" to-ports="*" secure="false" />
        <site-control permitted-cross-domain-policies="master-only" />
    </cross-domain-policy>\0
    EOS
    send_data policy
  end
end
