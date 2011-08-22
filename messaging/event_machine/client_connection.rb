require File.dirname(__FILE__) + '/modules/flash_server.rb'
require File.dirname(__FILE__) + '/modules/connection_shared.rb'

# awesome stuff happening here
class ClientConnection < FlashServer
  include Rabbit
  include ConnectionShared
  
  def initialize tracker
    super()
    
    @tracker = tracker
  end
  
  def post_init
    super
    custom_post_initialize # from ConnectionShared
  end
  
  def unbind
    custom_unbind # from ConnectionShared
  end
  
end
