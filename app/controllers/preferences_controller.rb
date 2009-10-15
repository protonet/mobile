class PreferencesController < ApplicationController
  
  def index
    @preferences = [{:url => 'foobar', :name => 'your profile'}, {:url => 'networks', :name => 'network settings'}]
    @network_interfaces = System::Backend.get_interfaces
  end
  
end
