module System
  class ReleasesController < ApplicationController
    
    def update
      render :text => "Software update was #{System::Release.update! ? 'successful!' : 'a FAIL!'}"
    end
    
  end
end