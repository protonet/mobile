class Listen < ActiveRecord::Base
  include FlagShihTzu
  
  belongs_to :user
  belongs_to :channel
  
  # verification
  #   verified   = owner of channel has verified that user listens to channel
  #   unverified = hm... what do you think? ;)
  has_flags 1 => :verified
  
end
