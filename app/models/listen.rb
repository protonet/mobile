class Listen < ActiveRecord::Base
  
  belongs_to :user
  belongs_to :channel
  
  default_scope :order => :order_number
  scope :verified, :conditions => {:verified => true}

  
  # if a channel is public we set the verified status to public
  after_create :auto_set_verification

  def auto_set_verification
    self.verified = true if channel.public? || channel.owned_by(user)
    save
  end
  
end
