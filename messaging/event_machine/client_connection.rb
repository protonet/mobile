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
  
end
