class AppsController < ApplicationController

  def show
    @app = AppDashboardBinding.find_by_app_key(params[:app_key])
  end

end
