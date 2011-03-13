class LdapUser  < ActiveLdap::Base
  ldap_mapping :dn_attribute => 'uid', :prefix => 'ou=People', :classes => ['top', 'account', 'posixAccount', 'shadowAccount']
  belongs_to :groups, :class => 'LdapGroup', :many => 'memberUid', :primary_key => 'uid'

  # REFACTORE THIS! ;) I just hacked that - aj
  def self.create_for_user(user)
    begin
      create_ldap_user_for(user) unless LdapUser.exists?(user.login)
    rescue ActiveLdap::EntryNotFound
      create_ldap_user_for(user)
    end
  end

  def self.create_ldap_user_for(user)
    ldap_user = new(user.login)
    ldap_user.cn = user.login
    ldap_user.uid_number = 2000 + user.id
    ldap_user.gid_number = 2323
    ldap_user.home_directory = "/home/#{user.login}"
    ldap_user.userPassword = ActiveLdap::UserPassword.crypt(user.password)
    raise RuntimeError unless ldap_user.save
    ldap_user
  end

  # if User.exists?(name)
  #   $stderr.puts("User #{name} already exists.")
  #   exit 1
  # end
  # 
  # user = User.new(name)
  # user.add_class('shadowAccount')
  # user.cn = cn
  # user.uid_number = uid
  # user.gid_number = uid
  # user.home_directory = "/home/#{name}"
  # user.sn = "somesn"
  # unless user.save
  #   puts "failed"
  #   puts user.errors.full_messages
  #   exit 1
  # end

end

#<ActiveRecord::Errors:0x264e5e0 @errors={"gidNumber"=>["is required attribute by objectClass 'posixAccount'"], 
# "cn"=>["is required attribute by objectClass 'posixAccount': aliases: commonName"], 
# "homeDirectory"=>["is required attribute by objectClass 'posixAccount'"], 
# "uid"=>["is required attribute by objectClass 'account': aliases: userid", "is required attribute by objectClass 'posixAccount': aliases: userid", "is required attribute by objectClass 'shadowAccount': aliases: userid"], 
# "uidNumber"=>["is required attribute by objectClass 'posixAccount'"], 
# "dn"=>["isn't set: #<LdapUser objectClass:<top, account, posixAccount, shadowAccount>, must:<cn, gidNumber, homeDirectory, objectClass, uid, uidNumber>, 
#   
#   >> u.userPassword = ActiveLdap::UserPassword.crypt('foobar')
  