class Invitation < ActiveRecord::Base
  serialize :channel_ids

  belongs_to :user
  belongs_to :invitee, :class_name => 'User'
  
  validates_format_of :email, :with => Devise::EMAIL_REGEX
  validates_length_of :channel_ids, :minimum => 1, :message => "must be provided"
  validates_presence_of :token
  
  before_validation :generate_token, :on => :create
  after_create  :send_email
  
  private
  
  def generate_token
    self.token = ActiveSupport::SecureRandom.base64(10)
  end
  
  def send_email
    Mailer.deliver_invitation(self)
  end
end
