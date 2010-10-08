ActionController::Routing::Routes.draw do |map|

  # channels
  map.connect 'channels/search', :controller => 'channels', :action => 'search'

  map.list_channels 'channels/list.:format', :controller => 'channels', :action => 'list'
  map.list_user_channels 'users/list_channels.:format', :controller => 'users', :action => 'list_channels'
  map.resources :channels do |channels|
    channels.resources :tweets
  end
  map.destroy_channel 'channels/:id/destroy', :controller => 'channels', :action => 'destroy'

  # tweets
  map.sync_tweets 'tweets/sync', :controller => 'tweets', :action => 'sync'
  map.resources   :tweets
  map.more_tweets '/more_tweets/:tweet_id/:channel_id/:later/:earlier/:pos.:format',
    :controller => 'search', :action => 'more_tweets'

  # listens
  map.listen_to_channel  'listens/create', :controller => 'listens', :action => 'create'
  map.resources   :listens do |listen|
    listen.accept '/accept', :controller => 'listens', :action => 'accept'
  end

  # networks
  map.negotiate_network 'networks/negotiate.:format', :controller => 'networks', :action => 'negotiate'
  map.resources   :networks do |networks|
    networks.map      'map',       :controller => 'networks', :action => 'map'
    networks.couple   'couple',    :controller => 'networks', :action => 'couple'
    networks.decouple 'decouple',  :controller => 'networks', :action => 'decouple'
    networks.join     'join',    :controller => 'networks', :action => 'join'
    networks.leave    'leave',   :controller => 'networks', :action => 'leave'
    
    networks.resources :channels
  end

  # preferences
  map.preferences '/preferences', :controller => 'preferences', :action => 'index'

  # navigation
  map.navigation '/navigation', :controller => 'navigation', :action => 'index'
  
  # session / login / logout stuff
  map.resource :session
  map.logout '/logout', :controller => 'sessions', :action => 'destroy'
  map.login '/login', :controller => 'sessions', :action => 'new'
  map.register '/register', :controller => 'users', :action => 'create'
  map.signup '/signup', :controller => 'users', :action => 'new'
  map.create_token_session 'sessions/create_token.:format', :controller => 'sessions', :action => 'create_token'
  

  # TODO what is this?
  map.search '/search.:format', :controller => 'search', :action => 'index'
  
  # user stuff
  map.delete_stranger_older_than_two_days 'users/delete_stranger_older_than_two_days', :controller => 'users', :action => 'delete_stranger_older_than_two_days'
  map.resources :users, :has_one => 'setting'

  # system
  map.namespace :system do |system|
    system.foundations            'foundations', :controller => 'foundations'
    system.files_create_directory 'files/create_directory', :controller => 'files', :action => 'create_directory'
    system.resources              :files
    system.vpn_on                 'vpn/on',   :controller => 'vpn',   :action => 'on'
    system.vpn_off                'vpn/off',  :controller => 'vpn',   :action => 'off'
    system.wifi_on                'wifi/on',  :controller => 'wifi',  :action => 'on'
    system.wifi_off               'wifi/off', :controller => 'wifi',  :action => 'off'
    system.preferences_update     'preferences/update', :controller => 'preferences', :action => 'update'
  end

  # images
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

  # sprockets
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
