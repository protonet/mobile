module System
  class ReleasesController < ApplicationController
    
    def update
      response = if current_user.admin?
        "Software update was #{System::Release.update! ? 'successful!' : 'a FAIL!'}"
      else
        "You're no admin, man, what are you doing here?"
      end
      render :text => response
    end
    
  end
end