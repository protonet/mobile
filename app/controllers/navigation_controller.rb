class NavigationController < ApplicationController
  
  def index
    respond_to do |format|
      format.js do
        render :template => 'navigation/index.html', :layout => false
      end
    end
  end
  
end
