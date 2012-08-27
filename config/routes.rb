Dashboard::Application.routes.draw do
  
  # Captive
  match 'captive' => 'system/captive#index'
  match 'captive/login' => 'system/captive#login'
  match 'captive/browser_check' => 'system/captive#browser_check'
  match 'captive/grant' => 'system/captive#grant'
  match 'captive/revoke' => 'system/captive#revoke'
  match 'captive/whitelist_clients' => 'system/captive#whitelist_clients'
  match 'captive/whitelist_sites' => 'system/captive#whitelist_sites'

  match 'apps/:app_key' => 'apps#show', :as => :app
  match 'unittest' => 'application#unittest'
  
  # Channels
  match 'channels/info' => 'channels#info', :as => :show_channel_info
  
  resources :channels do
    collection do
      match "/global" => "channels#global", :as => :global
      match "/global/:uuid" => "channels#show_global", :as => :show_global
    end
    resources :meeps
  end
  
  # meeps
  match 'meep/:id' => 'meeps#show' # Needed for backwards compatibility
  match 'meeps/sync' => 'meeps#sync', :as => :sync_meeps
  match 'meeps/before' => 'meeps#before', :as => :meeps_before
  match 'meeps/after' => 'meeps#after', :as => :meeps_after
  
  resources :meeps
  
  # files
  match 'files/play' => 'files#play', :as => :play_files
  
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
  devise_for :users, :controllers => { 
    :registrations => "registrations",
    :passwords => "passwords"
  }
  
  match '/auth/facebook/callback', :to => 'omniauth_callbacks#facebook'
  match '/auth/twitter/callback', :to => 'omniauth_callbacks#twitter'
  
  match 'users/update' => 'users#update', :as => :user_update
  match 'users/:id/start_rendezvous' => 'users#start_rendezvous', :as => :start_rendezvous, :via => [:post]
  match 'users/:id/meeps_with_text_extension' => 'users#meeps_with_text_extension', :as => :meeps_with_text_extension, :via => [:get]
  match 'users/update_last_read_meeps' => 'users#update_last_read_meeps', :as => :update_last_read_meeps, :via => [:put]
  match 'users/search' => 'users#search', :as => :search_users, :via => [:get]
  match 'users/my_profile'  => 'users#my_profile', :as => :my_profile, :via => [:get]
  match 'users/remove_newbie_flag' => 'users#remove_newbie_flag', :as => :remove_newbie_flag, :via => [:post]
  match 'users/newbie_todo_list' => 'users#newbie_todo_list', :as => :newbie_todo_list, :via => [:get]
  match 'users/channels' => 'users#channels', :as => :user_channels
  match 'users/info' => 'users#info', :as => :show_user_info
  
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
    match 'releases/update_progress' => 'releases#release_update_progress', :as => :release_update_progress
    match 'releases/send_log_to_support_team' => 'releases#send_log_to_support_team', :as => :send_log_to_support_team
    match 'app_installer/install' => 'app_installer#install', :as => :install_app
    match 'app_installer/uninstall' => 'app_installer#uninstall', :as => :uninstall_app
    resources :app_sources, :only => [:create, :destroy] do
      collection do
        put :refresh_all
      end
    end
    resources :app_dashboard_bindings, :only => [:create, :destroy]
  end
  
  # Files
  resources :files
  
  # System
  namespace :system do
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
      match 'users/find_by_login/:login' => 'users#find_by_login', :constraints => {:login => /[^\/]+/} 
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