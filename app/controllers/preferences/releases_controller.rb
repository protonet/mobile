module Preferences
  class ReleasesController < ApplicationController
    filter_access_to :all, :context => :preferences
    
    def update
      if current_user.admin?
        unless SystemRelease.password_correct?(params["password"])
          flash[:error] = "Wrong password (remember, this is your ssh node password)!"
          return respond_to_preference_update(417)
        else
          if (results = SystemRelease.update!(params["password"], params["release"]))
            response  = []
            success   = true
            results.each do |k,v|
              response.push("#{k} success: #{v}")
              success = false unless v
            end
            
            success ? flash[:notice]  = "Software update succeeded." :
                      flash[:error]   = "Software update failed. Please contact the protonet support."
          else
            flash[:error] = "Couldn't start software update. Please check with the protonet support."
          end
        end
      else
        flash[:error] = "You're no admin, man, what are you doing here?"
      end
      
      respond_to_preference_update
    end
  end
end