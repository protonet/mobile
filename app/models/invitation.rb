class Invitation < ActiveRecord::Base
  serialize :channel_ids

  belongs_to :user
  belongs_to :invitee, :class_name => 'User'
  
  validates_format_of :email, :with => Devise.email_regexp
  validates_length_of :channel_ids, :minimum => 1, :message => "must be provided"
  validates_presence_of :token
  
  before_validation :generate_token, :on => :create
  after_create  :send_email
  
  scope :unaccepted, :conditions => { :accepted_at => nil }
  
  private
  
  def generate_token
    self.token ||= ActiveSupport::SecureRandom.base64(14).gsub(/[^a-zA-Z0-9]/, '')
  end
  
  def send_email
    if SystemPreferences.local_email_delivery == true
      Mailer.invitation(self).deliver
    else
      Net::HTTP.post_form(URI.parse("http://invitation.protonet.info/send"), {
        :license_key => SystemBackend.license_key,
        :inviter_name => user.login,
        :inviter_email => user.email,
        :invitee_email => email,
        :message => message,
        :token => token
      })
    end
  end
end
