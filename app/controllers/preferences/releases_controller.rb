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
    
    # gets called via javascript if the user wants to see the log output
    # the sed command filters out shell color codes
    def release_update_progress
      text = `cat /tmp/ptn_release_update.log | sed 's/\\\033[^a-zA-Z]*.//g'`
      render :json => { :status => :ok, :success => true, :text => text }, :status => 200
    end
    
    def send_log_to_support_team
      flash[:notice] = "Log has been sucessfully sent to the protonet support"
      log_file = `cat /tmp/ptn_release_update.log | sed 's/\\\033[^a-zA-Z]*.//g'`
      Mailer.update_log(Node.local.name, SystemBackend.license_key, log_file, current_user).deliver
      render :json => { :status => :ok, :success => true, :text => "Mail send" }, :status => 200
    end
    
  end
end