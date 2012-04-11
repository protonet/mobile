authorization do
  role :guest do
    has_permission_on :meeps, :to => [:read, :create, :sync]
    has_permission_on :meeps do
      to [:delete]
      if_attribute :user => is {user}
    end
    has_permission_on :users, :to => [:rendezvous, :update_last_read_meeps]
    has_permission_on :channels do
      to [:show]
      if_attribute :users => contains {user}
    end
  end
  
  role :invitee do
    has_permission_on :meeps, :to => [:read, :create, :sync]
    has_permission_on :meeps do
      to [:delete]
      if_attribute :user => is {user}
    end
    has_permission_on :users, :to => [:show, :rendezvous, :update_last_read_meeps, :newbie]
    has_permission_on :channels, :to => [:index]
    has_permission_on :channels do
      to [:show]
      if_attribute :users => contains {user}
    end
    has_permission_on :users do 
      to [:update, :show, :change_password, :my_profile]
      if_attribute :id => is {user.id}
    end
  end
  
  role :user do
    has_permission_on :meeps, :to => [:read, :create, :sync]
    has_permission_on :meeps do
      to [:delete]
      if_attribute :user => is {user}
    end
    has_permission_on :listens, :to => [:create]
    has_permission_on :listens do
      to [:read, :delete, :update]
      if_attribute :user => is {user}
    end
    has_permission_on :listens do
      to [:accept, :delete, :create_for_user]
      if_attribute :channel => { :owner => is {user} }
    end
    
    has_permission_on :channels, :to => [:read, :create]
    has_permission_on :channels do
      to [:manage]
      if_attribute :owner => is {user}
    end
    # todo, this is too much
    has_permission_on :users, :to => [:read, :rendezvous, :update_last_read_meeps, :newbie]
    has_permission_on :users do 
      to [:manage, :change_password]
      if_attribute :id => is {user.id}
    end
  end
  
  role :admin do
    has_permission_on :meeps, :to => [:manage, :read, :create, :delete, :sync]
    has_permission_on :channels, :to => [:manage]
    has_permission_on :nodes, :to => [:manage]
    has_permission_on :listens, :to => [:manage, :accept, :create_for_user]
    has_permission_on :invitations, :to => :manage
    has_permission_on :authorization_rules, :to => :read
    has_permission_on :users, :to => [:manage, :delete_stranger_older_than_two_days, :rendezvous, :update_last_read_meeps, :newbie, :update_roles]
    has_permission_on :preferences, :to => [:update, :interface_status, :release_update_progress, :send_log_to_support_team]
    has_permission_on :system_preferences, :to => :update
    has_permission_on :publish_to_web, :to => [:update, :publish_status]
  end
end

privileges do
  # default privilege hierarchies to facilitate RESTful Rails apps
  privilege :manage, :includes => [:create, :read, :update, :delete, :destroy, :show,
    :change_password, :update_user_admin_flag, :generate_new_password, :search, :send_javascript, :send_system_message]
  privilege :newbie, :includes => [:remove_newbie_flag, :newbie_todo_list]
  privilege :rendezvous, :includes => [:start_rendezvous]
  privilege :read, :includes => [:index, :before, :after, :show, :my_profile, :search, :global, :show_global, :meeps_with_text_extension]
  privilege :create, :includes => :new
  privilege :update, :includes => :edit
  privilege :delete, :includes => :destroy
end