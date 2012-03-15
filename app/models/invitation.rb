class Invitation < ActiveRecord::Base
  serialize :channel_ids

  belongs_to :user
  belongs_to :invitee, :class_name => 'User'
  
  validates_format_of :email, :with => Devise.email_regexp
  validates_length_of :channel_ids, :minimum => 1, :message => "must be provided"
  validates_presence_of :token
  validates_uniqueness_of :email, :on => :create
  
  before_validation :generate_token, :on => :create
  
  scope :unaccepted, :conditions => { :accepted_at => nil }
  
  validate :check_email
  
  def check_email
    errors.add :email, "is already taken." if User.find_by_email(email)
  end
  
  def send_email
    Mailer.invitation(self).deliver
  end
  
  def status
    return :success if invitee
    return :sent if sent_at
    return :open
  end
  
  def channels
    Channel.where(:id => channel_ids)
  end
  
  private
  
  def generate_token
    self.token ||= ActiveSupport::SecureRandom.base64(14).gsub(/[^a-zA-Z0-9]/, '')
  end
  
end
