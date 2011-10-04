module Preferences
  class ReleasesController < ApplicationController
    
    def update
      if current_user.admin?
        unless SystemRelease.password_correct?(params["password"])
          flash[:error] = "Wrong password (remember, this is your ssh node password for the protonet user)!"
          if request.xhr?
            head(204)
          else
            redirect_to :back
          end
          return
        else
          if (results = SystemRelease.update!(params["password"], params["release"]))
            response  = []
            success   = true
            results.each do |k,v|
              response.push("#{k} success: #{v}")
              success = false unless v
            end
            success ? flash[:notice]  = "Software update succeeded. Technical details: #{response.join(", ")}" :
                      flash[:error]   = "Software update failed. Please contact the protonet support. Technical details: #{response.join(", ")}"
          else
            flash[:error] = "Couldn't start software update... please check with protonet support!"
          end
        end
      else
        flash[:error] = "You're no admin, man, what are you doing here?"
      end
      
      if request.xhr?
        head(204)
      else
        redirect_to :back
      end
    end
  end
end