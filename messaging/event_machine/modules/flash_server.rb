require File.join(File.dirname(__FILE__), '..', 'flash_connection')

# this is the class to handle policy talk with flash sockets
class FlashServer < FlashConnection
  @policy_sent = false
  
  def receive_data data
    # log("policy server receiving: #{data}")
    messages = data.split("\0")
    unless @policy_sent
      @policy_sent = true
      log(messages.inspect)
      return super(messages[1]) if messages[1]
      return send_swf_policy if messages[0].match(/policy-file-request/)
    end
    # log("doing nothing, handing data over to dispatcher")
    super
  end
  
  # this is a flash security policy thing that needs to be sent on
  # the first request to the server
  def send_swf_policy
    log("sending policy")
    policy = <<-EOS
    <?xml version="1.0" encoding="UTF-8"?> 
    <cross-domain-policy xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.adobe.com/xml/schemas/PolicyFileSocket.xsd">
        <allow-access-from domain="*" to-ports="*" secure="false" />
        <site-control permitted-cross-domain-policies="master-only" />
    </cross-domain-policy>\0
    EOS
    send_data(policy)
  end
end
