class PreferencesController < ApplicationController
  
  def index
    @preferences = [{:url => 'foobar', :name => 'your profile'}, {:url => 'networks', :name => 'network settings'}]
  end
  
end
