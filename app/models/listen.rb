class Listen < ActiveRecord::Base
  include FlagShihTzu
  
  belongs_to :user
  belongs_to :channel
  
  # verification
  #   verified   = owner of channel has verified that user is allowed to listen to this channel
  #   unverified = unverified, this is the default
  has_flags 1 => :verified
  named_scope :verified, :conditions => {:verified => true}
  
  # if a channel is public we set the verified status to public
  after_create :auto_set_verification

  def auto_set_verification
    self.verified = true if channel.public? || channel.owned_by(user)
    save
  end
  
end
