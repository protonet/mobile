class Invitation < ActiveRecord::Base
  serialize :channel_ids

  belongs_to :user
  
  validates_format_of :email, :with => Devise::EMAIL_REGEX
  validates_length_of :channel_ids, :minimum => 1, :message => "must be provided"
  
  before_create :generate_token
  after_create  :send_email
  
  private
  
  def generate_token
    self.token = ActiveSupport::SecureRandom.base64(10)
  end
  
  def send_email
    Mailer.deliver_invitation(self)
  end
end
