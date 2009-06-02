class LdapGroup  < ActiveLdap::Base
  ldap_mapping :classes => ['top', 'posixGroup'], :prefix => 'ou=Groups'
  has_many :members, :class => "LdapUser", :many => "memberUid"
  has_many :primary_members, :class => 'LdapUser', :foreign_key => 'gidNumber', :primary_key => 'gidNumber'
end
