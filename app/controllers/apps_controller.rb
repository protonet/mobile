class AppsController < ApplicationController

  def show
    @app = AppManager.find(params[:app_key])
    raise ActionController::RoutingError.new('Not Found') if @app.nil?
  end

end
