module System
  class ReleasesController < ApplicationController
    
    def update
      System::Release.update!
      render :text => 'bam!'
    end
    
  end
end