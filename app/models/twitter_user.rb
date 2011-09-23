require 'digest/sha1'

class TwitterUser < User
  
  devise :database_authenticatable, :registerable, :encryptable, :rememberable, :token_authenticatable, :encryptor => :restful_authentication_sha1
  
  class << self 
    def find_for_twitter_oauth(access_token, signed_in_resource=nil)
      data = access_token["user_info"]
      data["email"] = generate_email(data)

    if user = TwitterUser.find_by_email(data["email"])
      user
    elsif User.find_by_email(data["email"])
      user = User.new 
      user.errors.add :email_taken, "Your Email address is already taken. You are already a user"
      user
    else # Create a user with a stub password.
      login = generate_valid_name(data["name"])
      avatar_url = HTTParty.get("https://graph.facebook.com/#{data["id"]}/picture")
      
      TwitterUser.create(:email => data["email"], :password => Devise.friendly_token[0,20], 
      :login => data["nickname"], :name => data["name"], :twitter_id => data["uid"], 
      :avatar_url => data["image"])
    end
    end
    
    def generate_email(data)
      "#{data['nickname']}@protonet.info"
    end

  end
  
  def display_name
    login
  end
end
