Dashboard::Application.routes.draw do
  
  # Captive
  match 'captive' => 'system/captive#index'
  match 'captive/login' => 'system/captive#login'
  match 'captive/whitelist' => 'system/captive#whitelist'

  # Channels
  match 'channels/:id/guest/:token' => 'channels#guest_access', :as => :channel_guest_access
  match 'channels/list' => 'channels#list', :as => :list_channels
  match 'channels/list_global' => 'channels#list_global', :as => :list_global_channels
  match 'channels/show_global' => 'channels#show_global', :as => :show_global_channel
  match 'channels/recommended_global_teaser' => 'channels#recommended_global_teaser'
  
  resources :channels do
    resources :meeps
    collection do
      get 'global'
    end
    
    member do
      get 'details'
    end
  end
  match 'channels/:id/destroy' => 'channels#destroy', :as => :destroy_channel
  
  # meeps
  match 'meep/:id' => 'meeps#show' # Needed for backwards compatibility
  match 'meeps/sync' => 'meeps#sync', :as => :sync_meeps
  match 'meeps/before' => 'meeps#before', :as => :meeps_before
  match 'meeps/after' => 'meeps#after', :as => :meeps_after
  
  resources :meeps
  
  match 'listens/create' => 'listens#create', :as => :listen_to_channel
  match 'listens/create_for_user' => 'listens#create_for_user', :as => :listen_for_user
  # Listens
  resources :listens do
    match '/accept' => 'listens#accept', :as => :accept
  end
  
  # Invitations
  resources :invitations
  match '/join/:invitation_token' => 'registrations#new', :as => :accept_invitation
  
  # Node
  resources :nodes do
    resources :channels
  end
  
  # Preferences
  match '/preferences' => 'preferences#index', :as => :preferences
  match '/preferences/get_vpn.:format' => 'preferences#get_vpn', :as => :vpn_preferences
  match '/navigation' => 'navigation#index', :as => :navigation
  
  # Users
  devise_for :users, :controllers => { :registrations => "registrations" }
  
  match '/auth/facebook/callback', :to => 'omniauth_callbacks#facebook'
  match '/auth/twitter/callback', :to => 'omniauth_callbacks#twitter'
  
  match 'users/update' => 'users#update', :as => :user_update
  match 'users/:id/start_rendezvous' => 'users#start_rendezvous', :as => :start_rendezvous, :via => [:post]
  match 'users/:id/meeps_with_text_extension' => 'users#meeps_with_text_extension', :as => :meeps_with_text_extension, :via => [:get]
  match 'users/update_last_read_meeps' => 'users#update_last_read_meeps', :as => :update_last_read_meeps, :via => [:put]
  match 'users/search' => 'users#search', :as => :search, :via => [:get]
  match 'users/my' => 'users#my', :as => :my_user, :via => [:get]
  match 'users/delete_stranger_older_than_two_days' => 'users#delete_stranger_older_than_two_days', :as => :delete_stranger_older_than_two_days, :via => [:post]
  match 'users/remove_newbie_flag' => 'users#remove_newbie_flag', :as => :remove_newbie_flag, :via => [:post]
  match 'users/newbie_todo_list' => 'users#newbie_todo_list', :as => :newbie_todo_list, :via => [:get]
  
  resources :users
  
  # TODO what is this?
  match '/search.:format' => 'search#index', :as => :search

  # Preferences
  namespace :preferences do
    match 'privacy/update'  => 'privacy#update',  :as => :privacy_update
    match 'wifi/update'     => 'wifi#update',     :as => :wifi_update
    match 'publish_to_web/update'     => 'publish_to_web#update',         :as => :publish_to_web_update
    match 'publish_to_web/status'     => 'publish_to_web#publish_status', :as => :publish_to_web_status
    match 'vpn/update'      => 'vpn#update',      :as => :vpn_update
    match 'wifi/interface_status'     => 'wifi#interface_status',         :as => :interface_status
    match 'vpn/on'    => 'vpn#on',                :as => :vpn_on
    match 'vpn/off'   => 'vpn#off',               :as => :vpn_off
    match 'wifi/on'   => 'wifi#on',               :as => :wifi_on
    match 'wifi/off'  => 'wifi#off',              :as => :wifi_off
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
  
  namespace "api" do
    namespace "v1" do
      match 'channels/find_by_name/:name' => 'channels#find_by_name'
      match 'channels/find_by_uuid/:uuid' => 'channels#find_by_uuid'
      resources :channels do
        resources :users
      end
      resources :rendezvous
      resources :meeps
      match 'users/find_by_login/:login' => 'users#find_by_login'
      resources :users do
        match "auth_token" => "users#auth_token"
      end
      resources  :nodes
      resources  :couplings
      resource  :listens
    end
  end
    
  root :to => 'instruments#index'
  
  match "channel_data" => "instruments#channel_data"
  
  match '/:controller(/:action(/:id))'
  match '*a' => 'application#render_404'
end