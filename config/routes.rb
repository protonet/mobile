ActionController::Routing::Routes.draw do |map|

  map.connect 'channels/search', :controller => 'channels', :action => 'search'

  map.list_channels 'channels/list.:format', :controller => 'channels', :action => 'list'
  map.list_user_channels 'users/list_channels.:format', :controller => 'users', :action => 'list_channels'
  map.resources :channels do |channels|
    channels.resources :tweets
  end

  map.resources   :tweets

  map.listen_to_channel  'listens/create', :controller => 'listens', :action => 'create'
  map.resources   :listens do |listen|
    listen.accept '/accept', :controller => 'listens', :action => 'accept'
  end


  map.negotiate_network 'networks/negotiate.:format', :controller => 'networks', :action => 'negotiate'
  map.resources   :networks do |networks|
    networks.map      'map',       :controller => 'networks', :action => 'map'
    networks.couple   'couple',    :controller => 'networks', :action => 'couple'
    networks.decouple 'decouple',  :controller => 'networks', :action => 'decouple'
    networks.join     'join',    :controller => 'networks', :action => 'join'
    networks.leave    'leave',   :controller => 'networks', :action => 'leave'
    
    networks.resources :channels
  end

  map.preferences '/preferences', :controller => 'preferences', :action => 'index'
  map.navigation '/navigation', :controller => 'navigation', :action => 'index'
  map.logout '/logout', :controller => 'sessions', :action => 'destroy'
  map.login '/login', :controller => 'sessions', :action => 'new'
  map.register '/register', :controller => 'users', :action => 'create'
  map.signup '/signup', :controller => 'users', :action => 'new'

  map.search '/search.:format', :controller => 'search', :action => 'index'
  map.more_tweets '/more_tweets/:tweet_id/:channel_id/:later/:earlier/:pos.:format',
    :controller => 'search', :action => 'more_tweets'

  map.destroy_channel 'channels/:id/destroy', :controller => 'channels', :action => 'destroy'

  map.create_token_session 'sessions/create_token.:format', :controller => 'sessions', :action => 'create_token'

  map.delete_stranger_older_than_two_days 'users/delete_stranger_older_than_two_days', :controller => 'users', :action => 'delete_stranger_older_than_two_days'
  map.resources :users, :has_one => 'setting'

  map.resource :session

  map.namespace :system do |system|
    system.connect            'foundations', :controller => 'foundations'
    system.namespace :files_controller do |files|
      files.create_directory   'create_directory', :action => 'create_directory'
    end
    system.resources    :files
  end

  map.namespace :images do |images|
    images.resources :avatars
    #  crazy resizing on the fly, I had to slightly uglify the url so the rails caching can handle it
    # examples:
    # /images/externals/resize/0/0/http://www.goddesscruise.com/parts_of_boat.gif      -> for original size
    # /images/externals/resize/100/100/http://www.goddesscruise.com/parts_of_boat.gif  -> any other size ;)
    images.connect  'externals/show',       :controller => 'externals', :action => 'show'
    images.connect  'externals/is_available', :controller => 'externals', :action => 'is_available'
    images.resources :externals
  end

  SprocketsApplication.routes(map, :resources)

  # The priority is based upon order of creation: first created -> highest priority.

  # Sample of regular route:
  #   map.connect 'products/:id', :controller => 'catalog', :action => 'view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   map.purchase 'products/:id/purchase', :controller => 'catalog', :action => 'purchase'
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   map.resources :products

  # Sample resource route with options:
  #   map.resources :products, :member => { :short => :get, :toggle => :post }, :collection => { :sold => :get }

  # Sample resource route with sub-resources:
  #   map.resources :products, :has_many => [ :comments, :sales ], :has_one => :seller

  # Sample resource route with more complex sub-resources
  #   map.resources :products do |products|
  #     products.resources :comments
  #     products.resources :sales, :collection => { :recent => :get }
  #   end

  # Sample resource route within a namespace:
  #   map.namespace :admin do |admin|
  #     # Directs /admin/products/* to Admin::ProductsController (app/controllers/admin/products_controller.rb)
  #     admin.resources :products
  #   end

  # You can have the root of your site routed with map.root -- just remember to delete public/index.html.
  map.root :controller => "instruments"

  # See how all your routes lay out with "rake routes"

  # Install the default routes as the lowest priority.
  # Note: These default routes make all actions in every controller accessible via GET requests. You should
  # consider removing the them or commenting them out if you're using named routes and resources.
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'
end
