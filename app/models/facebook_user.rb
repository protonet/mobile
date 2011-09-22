require 'digest/sha1'

class FacebookUser < User
  
  devise :omniauthable, :database_authenticatable, :registerable, :encryptable, :rememberable, :token_authenticatable, :encryptor => :restful_authentication_sha1
  
  class << self 
    def find_for_facebook_oauth(access_token, signed_in_resource=nil)
      data = access_token['extra']['user_hash']

      p data["email"]
      if user = FacebookUser.find_by_email(data["email"])
        p "1"
        user
      elsif User.find_by_email(data["email"])
        p "2"
        user = User.new 
        user.errors.add :email_taken, "Your Email address is already taken. You are already a user"
        user
      else # Create a user with a stub password.
        p "3"
        login = generate_valid_name(data["name"])
        avatar_url = HTTParty.get("https://graph.facebook.com/#{data["id"]}/picture")
        p ''
        p avatar_url
        FacebookUser.create(:email => data["email"], :password => Devise.friendly_token[0,20], 
          :login => login, :name => data["name"], :facebook_id => data["id"], 
          :avatar_url => "https://graph.facebook.com/#{data['id']}/picture" )
      end
    end
    
    def generate_valid_name(name)
      name.gsub(/[^0-9A-Za-z]/, '.')
    end

  end
  
  def display_name
    login
  end
end
