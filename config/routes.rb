Dashboard::Application.routes.draw do
  
  # Captive
  match 'captive' => 'system/captive#index'
  match 'captive/login' => 'system/captive#login'
  
  # Channels
  match 'channels/search' => 'channels#search'
  match 'channels/list.:format' => 'channels#list', :as => :list_channels
  match 'users/list_channels.:format' => 'users#list_channels', :as => :list_user_channels
  
  resources :channels do
    resources :tweets
  end
  match 'channels/:id/destroy' => 'channels#destroy', :as => :destroy_channel
  
  # Tweets
  match 'tweets/sync' => 'tweets#sync', :as => :sync_tweets
  match 'tweets/before' => 'tweets#before', :as => :tweets_before
  match 'tweets/after' => 'tweets#after', :as => :tweets_after
  
  resources :tweets
  
  match '/more_tweets/:tweet_id/:channel_id/:later/:earlier/:pos.:format' => 'search#more_tweets', :as => :more_tweets
  match 'listens/create' => 'listens#create', :as => :listen_to_channel
  
  # Listens
  resources :listens do
    match '/accept' => 'listens#accept', :as => :accept
  end
  
  # Invitations
  resources :invitations
  match '/join/:invitation_token' => 'registrations#new', :as => :accept_invitation
  
  # Networks
  match 'networks/negotiate.:format' => 'networks#negotiate', :as => :negotiate_network
  resources :networks do
    match 'map' => 'networks#map', :as => :map
    match 'couple' => 'networks#couple', :as => :couple
    match 'decouple' => 'networks#decouple', :as => :decouple
    match 'join' => 'networks#join', :as => :join
    match 'leave' => 'networks#leave', :as => :leave
    resources :channels
  end
  
  # Preferences
  match '/preferences' => 'preferences#index', :as => :preferences
  match '/preferences/get_vpn.:format' => 'preferences#get_vpn', :as => :vpn_preferences
  match '/navigation' => 'navigation#index', :as => :navigation
  
  # Users
  devise_for :users
  #match 'users' => 'sessions#index', :as => :devise_for, :path_names => { :sign_in => 'login', :sign_out => 'logout' }
  get 'login' => 'sessions#new', :as => :new_user_session
  post 'login' => 'sessions#create', :as => :login
  get 'logout' => 'sessions#destroy', :as => :logout
  match '/register' => 'users#create', :as => :register
  match '/signup' => 'users#new', :as => :signup
  match 'users/delete_stranger_older_than_two_days' => 'users#delete_stranger_older_than_two_days', :as => :delete_stranger_older_than_two_days
  
  resources :users
  
  # TODO what is this?
  match '/search.:format' => 'search#index', :as => :search
  
  # System
  namespace :system do
    match 'foundations' => 'foundations#index', :as => :foundations
    match 'files/create_directory' => 'files#create_directory', :as => :files_create_directory
    resources :files
    match 'vpn/on' => 'vpn#on', :as => :vpn_on
    match 'vpn/off' => 'vpn#off', :as => :vpn_off
    match 'wifi/on' => 'wifi#on', :as => :wifi_on
    match 'wifi/off' => 'wifi#off', :as => :wifi_off
    match 'preferences/update' => 'preferences#update', :as => :preferences_update
    match 'releases/update' => 'releases#update', :as => :release_update
  end
  
  # Images
  namespace :images do
    resources :avatars
  end
  
  # TODO: RAILS 3
  # Sprockets
  # SprocketsApplication.routes(map, :resources)
  
  root :to => 'instruments#index'
  match '/:controller(/:action(/:id))'
  match '*path' => 'system/captive#catchall'
  
  
end