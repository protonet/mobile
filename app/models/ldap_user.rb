class LdapUser  < ActiveLdap::Base
  ldap_mapping :dn_attribute => 'uid', :prefix => 'ou=People', :classes => ['top', 'account', 'posixAccount', 'shadowAccount']
  belongs_to :groups, :class => 'Group', :many => 'memberUid', :foreign_key => 'uid'
  
  def self.create_for_user(user)
    unless LdapUser.exists?(user.name)
      ldap_user = new(user.name)
      ldap_user.add_class('shadowAccount')
      ldap_user.cn = cn
      ldap_user.uid_number = uid
      ldap_user.gid_number = uid
      ldap_user.home_directory = "/home/#{user.name}"
    end
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
