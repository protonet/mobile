require 'digest/sha1'

class FacebookUser < User
  
  devise :database_authenticatable, :registerable, :encryptable, :rememberable, :token_authenticatable, :encryptor => :restful_authentication_sha1
  
  class << self 
    def find_for_facebook_oauth(access_token, signed_in_resource=nil)
      data = access_token['extra']['user_hash']

      if user = FacebookUser.find_by_email(data["email"])
        user
      elsif User.find_by_email(data["email"])
        user = User.new 
        user.errors.add :email_taken, "Your Email address is already taken. You are already a user"
        user
      else # Create a user with a stub password.
        login = generate_valid_name(data["name"])

        FacebookUser.create(:email => data["email"], :password => Devise.friendly_token[0,20],
          :login => login, :name => data["name"], :facebook_id => data["id"], 
          :avatar_url => "https://graph.facebook.com/#{data['id']}/picture" )
      end
    end
  end
  
  def display_name
    login
  end
end
