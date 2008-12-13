# of a chat channel he will connect here
# event = 0
# subscriber_id = array
# Q: how to find the client to a specific id
# A: I have no f'in clue
#
# TODO: permission per channel, multiple event ids
class Event
  @@event_list = []

  include DataMapper::Resource
  
  
  property :id,                         Integer,  :serial => true
  property :event_id,                   Integer,   :nullable => false

  def initialize
    @@event_list[0] = 0
  end
  
  def self.list
    # for debug purpose print all subscribers
    puts @@event_list
  end 

  def self.subscribe(event, id)
    # subscribe to the chat channel
    @@event_list[event] = id 
  end

  def self.find_subscribers(event)
    # find the subscribers of a certain event
    @@event_list[event]
  end

  def self.find_subscribers_for_default
    # TODO: for debugging purposes since we only have a single chat channel for now
    @@event_list[0]
  end

  def self.subscribe_default(id)
    subscribe(0, id)
  end
end
