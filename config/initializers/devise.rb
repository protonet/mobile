# Use this hook to configure devise mailer, warden hooks and so forth. The first
# four configuration values can also be set straight in your models.
Devise.setup do |config|
  # Configure the e-mail address which will be shown in DeviseMailer.
  config.mailer_sender = "please-change-me@config-initializers-devise.com"
  # REST_AUTH_SITE_KEY
  config.pepper = "2717f8eb6b2409afb7f9e4318df0591f70f58260"
  # Configure how many times you want the password is reencrypted. Default is 10.
  config.stretches = 10
  config.encryptor = :restful_authentication_sha1
  config.authentication_keys = [ :login ]
  config.use_default_scope = true
  config.default_scope = :user
  # Devise.setup do |config|
  #   # Required
  #   config.ldap_host = configatron.ldap.host
  #   config.ldap_port = 636
  #   config.ldap_base_dn = configatron.ldap.base
  #   config.ldap_login_attribute = 'uid'

  #   # Optional, these will default to false or nil if not set
  #   config.ldap_ssl = true
  # end

  
  # Configure the content type of DeviseMailer mails (defaults to text/html")
  # config.mailer_content_type = "text/plain"


  # (default), :sha512 and :bcrypt. Devise also supports encryptors from others


  # The realm used in Http Basic Authentication
  # config.http_authentication_realm = "Application"

  # ==> Configuration for :confirmable
  # The time you want give to your user to confirm his account. During this time
  # he will be able to access your application without confirming. Default is nil.
  # config.confirm_within = 2.days

  # ==> Configuration for :rememberable
  # The time the user will be remembered without asking for credentials again.
  # config.remember_for = 2.weeks

  # ==> Configuration for :timeoutable
  # The time you want to timeout the user session without activity. After this
  # time the user will be asked for credentials again.
  # config.timeout_in = 10.minutes

  # ==> Configuration for :lockable
  # Number of authentication tries before locking an account.
  # config.maximum_attempts = 20

  # Defines which strategy will be used to unlock an account.
  # :email = Sends an unlock link to the user email
  # :time  = Reanables login after a certain ammount of time (see :unlock_in below)
  # :both  = enables both strategies
  # config.unlock_strategy = :both

  # Time interval to unlock the account if :time is enabled as unlock_strategy.
  # config.unlock_in = 1.hour

  # ==> Configuration for :token_authenticatable
  # Defines name of the authentication token params key
  # config.token_authentication_key = :auth_token

  # ==> General configuration
  # Load and configure the ORM. Supports :active_record (default), :mongo_mapper
  # (requires mongo_ext installed) and :data_mapper (experimental).
  # require 'devise/orm/mongo_mapper'
  # config.orm = :mongo_mapper

  # Turn scoped views on. Before rendering "sessions/new", it will first check for
  # "sessions/users/new". It's turned off by default because it's slower if you
  # are using only default views.
  # config.scoped_views = true

  # If you want to use other strategies, that are not (yet) supported by Devise,
  # you can configure them inside the config.warden block. The example below
  # allows you to setup OAuth, using http://github.com/roman/warden_oauth
  #
  # config.warden do |manager|
  #   manager.oauth(:twitter) do |twitter|
  #     twitter.consumer_secret = <YOUR CONSUMER SECRET>
  #     twitter.consumer_key  = <YOUR CONSUMER KEY>
  #     twitter.options :site => 'http://twitter.com'
  #   end
  #   manager.default_strategies.unshift :twitter_oauth
  # end

  # Configure default_url_options if you are using dynamic segments in :path_prefix
  # for devise_for.
  # config.default_url_options do
  #   { :locale => I18n.locale }
  # end
end
