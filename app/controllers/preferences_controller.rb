class PreferencesController < ApplicationController

  before_filter :only_registered
  before_filter :set_available_preferences
  
  def index
    @selected_section = params[:section]
  end
  
  def show
    @selected_section = params[:section]
    return head(:not_available) unless @methods.include?(@selected_section)
    
    if request.headers['X-Request-Type'] == 'tab'
      render :partial => @selected_section
    else
      render :index
    end
  end

  def set_available_preferences
    @preferences = current_user.roles.include?(Role.find_by_title!('admin')) ? [
      {:section => 'publish_to_web',    :name => 'Publish to web'},
      {:section => 'user_settings',     :name => 'User management'},
      {:section => 'customize',         :name => 'Customize the interface'},
      # TODO: Merge this into miscellaneous
      #{:section => 'network_settings',  :name => 'Network settings'},
      {:section => 'wifi_config',       :name => 'WLAN settings'},
      # Captive stuff. This is not finished yet
      #{:url => 'captive_settings', :name => 'Captive settings'},
      #{:url => 'webhook_settings', :name => 'Webhook settings'},
      {:section => 'privacy_settings',  :name => 'Privacy settings'},
      {:section => 'vpn_settings',      :name => 'VPN settings'},
      {:section => 'software_updates',  :name => 'Software updates'},
      {:section => 'information',       :name => 'Information'}
    ] : []
    
    @methods = @preferences.collect {|preference| preference[:section]}
  end

end
