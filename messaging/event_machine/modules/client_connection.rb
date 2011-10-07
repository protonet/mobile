require File.join(File.dirname(__FILE__), 'flash_server')
require File.join(File.dirname(__FILE__), 'connection_shared')

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
