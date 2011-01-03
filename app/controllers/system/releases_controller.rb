module System
  class ReleasesController < ApplicationController
    
    def update
      if current_user.admin?
        System::Release.update!(params["password"]) ? (flash[:notice] = "Software update was a SUCCESS!") : (flash[:error] = "Software update was a FAIL!")
      else
        flash[:error] = "You're no admin, man, what are you doing here?"
      end
      redirect_to :back
    end
    
  end
end