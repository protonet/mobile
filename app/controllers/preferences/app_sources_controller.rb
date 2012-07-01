module Preferences
  class AppSourcesController < ApplicationController
    before_filter :set_available_preferences

    def create
      @app_source = AppSource.new(params[:app_source])
      if @app_source.save
        flash[:notice] = "Source added."
        respond_to_app_installer_update
      else
        flash[:error] = "Check the following fields: #{@app_source.errors.full_messages.join(', ')}"
        respond_to_preference_update(417)
      end
    end

    def destroy
      @app_source = AppSource.find(params[:id])
      @app_source.destroy
      flash[:notice] = "Source successfully removed."
      respond_to_app_installer_update
    end

    def refresh_all
      AppSource.fetch_all!
      flash[:notice] = "Sources are up to date."
      respond_to_app_installer_update
    end

    private
    # temporary overwrite for rendering the right url in app preferences
    def set_request_url_to_header
      response.headers['X-Url'] = "/preferences/show?section=app_installer"
    end

  end
end