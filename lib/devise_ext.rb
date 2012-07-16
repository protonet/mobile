# MONKEYPATCH TO HANDLE LDAP CREATES ON LOGIN

module Devise
  module Strategies
    # Default strategy for signing in a user, based on his email and password in the database.
    class DatabaseAuthenticatable < Authenticatable
      def authenticate!
        if SystemPreferences.remote_ldap_sign_on
          login = authentication_hash[:login]
          # try to authenticate against the LDAP server
          ldap = Net::LDAP.new
          ldap.host = SystemPreferences.remote_ldap_host
          ldap.port = 636
          ldap.encryption :simple_tls # also required to tell Net:LDAP that we want SSL
          ldap.base = SystemPreferences.remote_ldap_base
          ldap.auth "#{login}@#{SystemPreferences.remote_ldap_domain}","#{password}"
          if ldap.bind # will return false if authentication is NOT successful
            User.find_by_login(login.downcase) || begin
              generated_password = ActiveSupport::SecureRandom.base64(10)
              LocalUser.create({:login => login, :email => "#{login}@#{SystemPreferences.remote_ldap_domain}", :password => generated_password})
            end
          end
        end

        resource = valid_password? && mapping.to.find_for_database_authentication(authentication_hash)

        if validate(resource){ resource.valid_password?(password) }
          resource.after_database_authentication
          success!(resource)
        elsif !halted?
          fail(:invalid)
        end
      end
    end
  end
end

# overwrite original strategy
Warden::Strategies._strategies[:database_authenticatable] = Devise::Strategies::DatabaseAuthenticatable
