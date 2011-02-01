authorization do
  role :guest do
    # add permissions for guests here, e.g.
    #has_permission_on :conferences, :to => :read
  end
  
  role :invitee do
    # has_permission_on :channels, :to => :read
  end
  
  role :user do
    has_permission_on :listens, :to => [:create]
    has_permission_on :listens do
      to [:read, :delete, :update]
      if_attribute :user => is {user}
    end
    has_permission_on :listens do
      to [:accept, :delete]
      if_attribute :channel => { :owner => is {user} }
    end
    
    has_permission_on :channels, :to => [:read, :create]
    has_permission_on :channels do
      to :manage
      if_attribute :owner => is {user}
    end
  end
  
  role :admin do
    has_permission_on :channels, :to => :manage
    has_permission_on :listens, :to => [:manage, :accept]
    has_permission_on :invitations, :to => :manage
    has_permission_on :authorization_rules, :to => :read
  end
end

privileges do
  # default privilege hierarchies to facilitate RESTful Rails apps
  privilege :manage, :includes => [:create, :read, :update, :delete]
  privilege :read, :includes => [:index, :show]
  privilege :create, :includes => :new
  privilege :update, :includes => :edit
  privilege :delete, :includes => :destroy
  privilege :accept # used for listens
end