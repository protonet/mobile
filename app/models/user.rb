class User
  include DataMapper::Resource
  
  before :save, :encrypt_password
  before :save, :downcase_login
  
  attr_accessor :password, :password_confirmation
  
  has n, :rooms
  
  property :id,                         Integer,  :serial => true
  property :name,                       String,   :nullable => true
  property :login,                      String,   :nullable => false, :unique => true # validates automatically on uniqueness
  property :crypted_password,           String
  property :salt,                       String
  property :remember_token_expires_at,  DateTime
  property :remember_token,             String
  property :realm_id,                   String
  property :online,                     Boolean
  
  validates_length            :login,                   :within => 3..40
  validates_present           :password
  validates_present           :password_confirmation
  validates_length            :password,                :within => 4..40
  validates_is_confirmed      :password,                :groups => :create
  
  def self.authenticate(params)
    u = first(:login => params[:login])
    if u
      u.crypted_password == u.encrypt(params[:password], u.salt) ? u : nil
    else
      nil
    end
  end
  
    
  # Encrypts some data with the salt.
  def encrypt(password, salt)
    Digest::SHA1.hexdigest("--#{salt}--#{password}--")
  end
  
  private
    def downcase_login
      login = login.downcase if login
    end

    def encrypt_password
      return if password.blank?
      self.salt = Digest::SHA1.hexdigest("--#{Time.now.to_s}--#{login}--") if new_record?
      self.crypted_password = encrypt(password, salt)
    end
  
end
