class NavigationController < ApplicationController
  
  def index    
    if logged_in?
      @allowed = { root_path => true,
      preferences_path => true,
      system_files_path => true,
      users_path => true,
      networks_path => true,
      channels_path => true
      }
    else
      @allowed = { root_path => true,
      preferences_path => false,
      system_files_path => false,
      users_path => false,
      networks_path => false,
      channels_path => false
      }
    end
    respond_to do |format|
      format.js do
        response.headers['Content-type'] = "text/html; charset=utf-8"
        render :template => 'navigation/index.html', :layout => false
      end
    end
  end
  
end
