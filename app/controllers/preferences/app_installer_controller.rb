module Preferences
	class AppInstallerController < ApplicationController

    before_filter :set_available_preferences

    def install
      if current_user.admin?

        unless SystemRelease.password_correct?(params["app"]["password"])
          flash[:error] = "Wrong password (remember, this is your ssh node password)!"
          return respond_to_preference_update(417)
        else
          if App.install(params[:app])
            flash[:notice]  = "Installation successful."
          else
            flash[:error] = "Couldn't install application. Please check with the protonet support."
          end
        end
      else
        flash[:error] = "You're no admin, man, what are you doing here?"
      end
    rescue App::ConfigurationRequirementsNotMet
      flash[:error] = "Configuration requirements not met. All fields are required."
    ensure
      respond_to_app_installer_update
    end

    def uninstall
      if current_user.admin?
        unless SystemRelease.password_correct?(params["app"]["password"])
          flash[:error] = "Wrong password (remember, this is your ssh node password)!"
          return respond_to_preference_update(417)
        else
          if App.uninstall(params[:app])
            flash[:notice]  = "App removal successful."
          else
            flash[:error] = "Couldn't uninstall application. Please check with the protonet support."
          end
        end
      else
        flash[:error] = "You're no admin, man, what are you doing here?"
      end
    rescue ActiveRecord::RecordNotFound
      flash[:error] = "App not found."
    ensure
      respond_to_app_installer_update
    end

    def release_update_progress
      text = `cat /tmp/ptn_app_install.log | sed 's/\\\033[^a-zA-Z]*.//g'`
      render :json => { :status => :ok, :success => true, :text => text }, :status => 200
    end

    private

    def respond_to_app_installer_update
      if request.xhr?
        @selected_section = 'preferences/app_installer'
        render :template => 'preferences/index'
      else
        redirect_to :controller => '/preferences', :action => :show, :section => params[:section]
      end
    end

	end
end