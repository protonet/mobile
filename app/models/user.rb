class User
  include DataMapper::Resource
  
  class TokenGenerationError < RuntimeError; end
  
  before :save, :encrypt_password
  before :save, :downcase_login
  
  attr_accessor :password, :password_confirmation
  
  has n, :chat_rooms
  has n, :chat_room_users
  has n, :joined_rooms, :through => :chat_room_users, :remote_name => :chat_rooms, :class_name => "ChatRoom", :child_key => "user_id"
  has 1, :profile, :class_name => 'UserProfile'
  
  property :id,                         Integer,  :serial => true
  property :name,                       String,   :nullable => true
  property :login,                      String,   :nullable => false, :unique => true # validates automatically on uniqueness
  property :crypted_password,           String
  property :salt,                       String
  property :remember_token_expires_at,  DateTime
  property :remember_token,             String
  property :current_ip,                 String,   :nullable => true
  property :last_polled_at,             DateTime
  property :realm_id,                   String
  property :online,                     Boolean
  property :token,                      String,   :nullable => true
  property :token_expires_at,           DateTime, :nullable => true
  
  validates_length            :login,                   :within => 3..40
  validates_present           :password,                :on => [:create, :password_change]
  validates_present           :password_confirmation,   :on => [:create, :password_change]
  validates_length            :password,                :within => 4..40, :on => [:create, :password_change]
  validates_is_confirmed      :password,                :on => [:create, :password_change]
  
  class << self
    
    def authenticate(params)
      u = first(:login => params[:login])
      if u
        u.crypted_password == u.encrypt(params[:password], u.salt) ? u : nil
      else
        nil
      end
    end
  
    def all_connected_users
      Backend.get_ips_of_currently_connected_clients.collect do |ip|
        User.first(:current_ip => ip) || User.new(:name => "not logged in yet ;) #{ip}")
      end.compact
    end
    
  end
  
  def join_room(room)
    # room.users << self && room.save unless room.users.include?(self)
    # TODO as soon as n-m associations and thru things work correclty this is done the old way:
    # http://datamapper.lighthouseapp.com/projects/20609-datamapper/tickets/725-bug-with-many-to-many-association
    ChatRoomUser.new(:user_id => self.id, :chat_room_id => room.id).save && reload unless ChatRoomUser.first(:user_id => self.id, :chat_room_id => room.id)
  end
  
  def leave_room(room)
    room_user = ChatRoomUser.first(:user_id => self.id, :chat_room_id => room.id)
    room_user.destroy && reload if room_user
  end
  
  def poll(ip, force_update=false)
    update_attributes(:current_ip => ip, :last_polled_at => DateTime.now) if (force_update || current_ip.nil? || !last_polled_at || last_polled_at < DateTime.now - 5.minutes)
  end
  
  def generate_new_token
    self.token = encrypt(crypted_password, DateTime.now)
    self.token_expires_at = DateTime.now + 1 # DateTime additions are in days
    @token
  end
  
  def token
    generate_new_token && self.save unless self.token_expires_at && self.token_expires_at > DateTime.now
    @token
  end
    
  def token_valid?(token)
    token == self.token && self.token_expires_at > DateTime.now
  end
  
  def display_name
    name || login
  end
  
  def attributes(scenario=nil)
    case scenario
    when :chat
      {:id => id, :name => display_name}.merge(profile && profile.attributes(:chat) || {})
    else
      super()
    end
  end
    
  # Encrypts some data with the salt.
  def encrypt(password, salt)
    Digest::SHA1.hexdigest("--#{salt}--#{password}--")
  end
  
  private
    def downcase_login
      # attr writer need to be called this way todo: find out why
      self.login = login.downcase if login
    end

    def encrypt_password
      return if password.blank?
      self.salt = Digest::SHA1.hexdigest("--#{Time.now.to_s}--#{login}--") if new_record?
      self.crypted_password = encrypt(password, salt)
    end
  
end
