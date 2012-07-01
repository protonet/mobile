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

end
