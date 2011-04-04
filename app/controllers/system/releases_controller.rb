module System
  class ReleasesController < ApplicationController
    
    def update
      if current_user.admin?
        (flash[:error] = "Wrong *NODE* password (remember, this is your ssh password for the protonet user)!" and return redirect_to :back) unless System::Release.password_correct?(params["password"])
        if(results = System::Release.update!(params["password"], params["release"]))
          response  = []
          success   = true
          results.each do |k,v|
            response.push("#{k} success: #{v}")
            success = false unless v
          end
          success ? flash[:notice] = "Software update was a SUCCESS! #{response.join(",")}" :
                    flash[:error] = "Software update was a FAIL! #{response.join(",")}"
        else
          flash[:error] = "Couldn't start software update... please check with protonet support!"
        end
      else
        flash[:error] = "You're no admin, man, what are you doing here?"
      end
      redirect_to :back
    end
    
  end
end