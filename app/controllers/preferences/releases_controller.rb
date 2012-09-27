module Preferences
  class ReleasesController < ApplicationController
    filter_access_to :all, :context => :preferences
    
    def update
      unless SystemRelease.password_correct?(params["password"])
        flash[:error] = t("preferences.flash_message_update_error_1")
        return respond_to_preference_update(417)
      else
        if (results = SystemRelease.update!(params["password"], params["release"]))
          success = true
          results.each do |k,v|
            success = false unless v
          end
          
          success ? flash[:notice]  = t("preferences.flash_message_update_success") :
                    flash[:error]   = t("preferences.flash_message_update_error_2")
        else
          flash[:error] = t("preferences.flash_message_update_error_3")
        end
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
      flash[:notice] = t("preferences.flash_message_log_sent_success")
      log_file = `cat /tmp/ptn_release_update.log | sed 's/\\\033[^a-zA-Z]*.//g'`
      Mailer.update_log(Node.local.name, SystemBackend.license_key, log_file, current_user).deliver
      render :json => { :status => :ok, :success => true, :text => "Mail send" }, :status => 200
    end
    
  end
end