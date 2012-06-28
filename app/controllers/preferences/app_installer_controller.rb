module Preferences
	class AppInstallerController < ApplicationController

    def install
      if current_user.admin?

        unless AppInstaller.password_correct?(params["app"]["password"])
          flash[:error] = "Wrong password (remember, this is your ssh node password)!"
          return respond_to_preference_update(417)
        else
          installation = AppInstaller.install(params[:app])
          if installation[:success]
            flash[:notice]  = "App installation succeeded."
          else
            flash[:error] = "Couldn't install application. Please check with the protonet support. Reason: #{installation[:message]}"
          end
        end
      else
        flash[:error] = "You're no admin, man, what are you doing here?"
      end
      respond_to_preference_update
    end

    def uninstall
      if current_user.admin?
        unless AppInstaller.password_correct?(params["app"]["password"])
          flash[:error] = "Wrong password (remember, this is your ssh node password)!"
          return respond_to_preference_update(417)
        else
          removal = AppInstaller.uninstall(params[:app][:name], params[:app][:password])
          if removal[:success]
            flash[:notice]  = "App removal was successful."
          else
            flash[:error] = "Couldn't uninstall application. Please check with the protonet support. Reason: #{removal[:message]}"
          end
        end
      else
        flash[:error] = "You're no admin, man, what are you doing here?"
      end
      respond_to_preference_update
    end

    def release_update_progress
      text = `cat /tmp/ptn_app_install.log | sed 's/\\\033[^a-zA-Z]*.//g'`
      render :json => { :status => :ok, :success => true, :text => text }, :status => 200
    end

	end
end