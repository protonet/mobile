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
  match 'users/delete_stranger_older_than_two_days' => 'users#delete_stranger_older_than_two_days', :as => :delete_stranger_older_than_two_days
  
  resources :users
  
  # TODO what is this?
  match '/search.:format' => 'search#index', :as => :search

  # Preferences
  namespace :preferences do
    match 'privacy/update' => 'privacy#update', :as => :privacy_update
    match 'vpn/on' => 'vpn#on', :as => :vpn_on
    match 'vpn/off' => 'vpn#off', :as => :vpn_off
    match 'wifi/on' => 'wifi#on', :as => :wifi_on
    match 'wifi/off' => 'wifi#off', :as => :wifi_off
    match 'releases/update' => 'releases#update', :as => :release_update
  end
  
  # System
  namespace :system do
    match 'files/create_directory' => 'files#create_directory', :as => :files_create_directory
    resources :files
    match 'preferences/update' => 'preferences#update', :as => :preferences_update
  end
  
  # Images
  namespace :images do
    resources :avatars
  end
  
  # js
  resources :sprockets, :only => :show
  
  # namespace "api/v1" do
  #   match 'meeps' => "api/meeps#index"
  # end
  
  match "api/v1/meeps"        => "api_v1/meeps#index"
  match "api/v1/meeps/create" => "api_v1/meeps#create"
  match "api/v1/meeps/show"   => "api_v1/meeps#show"

  
  root :to => 'instruments#index'
  match '/:controller(/:action(/:id))'
  match '*path' => 'system/captive#catchall', :constraints => System::CaptiveController
  
end