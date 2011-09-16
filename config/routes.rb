Dashboard::Application.routes.draw do
  
  # Captive
  match 'captive' => 'system/captive#index'
  match 'captive/login' => 'system/captive#login'
  
  # Channels
  match 'channels/:id/guest/:token' => 'channels#guest_access', :as => :channel_guest_access
  match 'channels/search' => 'channels#search'
  match 'channels/list.:format' => 'channels#list', :as => :list_channels
  match 'users/sort_channels' => 'users#sort_channels', :via => [:post]
  
  resources :channels do
    resources :meeps
  end
  match 'channels/:id/destroy' => 'channels#destroy', :as => :destroy_channel
  
  # meeps
  match 'meeps/sync' => 'meeps#sync', :as => :sync_meeps
  match 'meeps/before' => 'meeps#before', :as => :meeps_before
  match 'meeps/after' => 'meeps#after', :as => :meeps_after
  
  resources :meeps
  
  match '/more_meeps/:meep_id/:channel_id/:later/:earlier/:pos.:format' => 'search#more_meeps', :as => :more_meeps
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
  devise_for :users, :controllers => { :registrations => "registrations" }
  match 'users/update' => 'users#update', :as => :user_update
  match 'users/:id/start_rendezvous' => 'users#start_rendezvous', :as => :start_rendezvous, :via => [:post]
  match 'users/update_last_read_meeps' => 'users#update_last_read_meeps', :as => :update_last_read_meeps, :via => [:put]
  match 'users/delete_stranger_older_than_two_days' => 'users#delete_stranger_older_than_two_days', :as => :delete_stranger_older_than_two_days, :via => [:post]
  
  resources :users
  
  # TODO what is this?
  match '/search.:format' => 'search#index', :as => :search

  # Preferences
  namespace :preferences do
    match 'privacy/update'  => 'privacy#update', :as => :privacy_update
    match 'wifi/update'     => 'wifi#update', :as => :wifi_update
    match 'vpn/on'    => 'vpn#on', :as => :vpn_on
    match 'vpn/off'   => 'vpn#off', :as => :vpn_off
    match 'wifi/on'   => 'wifi#on', :as => :wifi_on
    match 'wifi/off'  => 'wifi#off', :as => :wifi_off
    match 'releases/update' => 'releases#update', :as => :release_update
  end
  
  # System
  namespace :system do
    match 'files/create_directory' => 'files#create_directory', :as => :files_create_directory
    match 'files/delete_directory' => 'files#delete_directory', :as => :files_delete_directory
    match 'files/delete' => 'files#delete', :as => :files_delete
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
  
  namespace "api" do
    namespace "v1" do
      resources :channels do
        resources :users
      end
      resources :rendezvous
      resources :meeps
      resources :users do
        match "auth_token" => "users#auth_token"
      end
      resource  :listens
    end
  end
    
  root :to => 'instruments#index'
  
  match "channel_data" => "instruments#channel_data"
  
  match '/:controller(/:action(/:id))'
  match '*path' => 'system/captive#catchall', :constraints => System::CaptiveController
  
end