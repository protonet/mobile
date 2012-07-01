module Preferences
  class AppDashboardBindingsController < ApplicationController
    before_filter :set_available_preferences

    def create
      @app_dashboard_binding = AppDashboardBinding.new(params[:app_dashboard_binding])
      if @app_dashboard_binding.save
        flash[:notice] = "App menuitem added."
        respond_to_app_installer_update
      else
        flash[:error] = "Check the following fields: #{@app_dashboard_binding.errors.full_messages.join(', ')}"
        respond_to_preference_update(417)
      end
    end

    def destroy
      @app_dashboard_binding = AppDashboardBinding.find(params[:id])
      @app_dashboard_binding.destroy
      flash[:notice] = "App menuitem removed."
      respond_to_app_installer_update
    end

    private
    # temporary overwrite for rendering the right url in app preferences
    def set_request_url_to_header
      response.headers['X-Url'] = "/preferences/show?section=app_installer"
    end

  end
end