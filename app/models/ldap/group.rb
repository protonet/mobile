module Ldap
  class Group  < ActiveLdap::Base
    ldap_mapping :classes => ['top', 'posixGroup'], :prefix => 'ou=Groups'
    has_many :members, :class => "Ldap::User", :wrap => "memberUid"
    has_many :primary_members, :class => 'Ldap::User', :foreign_key => 'gidNumber', :primary_key => 'gidNumber'
  end
end