class SprocketsController < ActionController::Base
  caches_page :show
  
  def index
    show
  end

  def show
    sprocket = nil
    if params[:id]
      sprocket = SprocketsApplication.sprocket(params[:id])
    else
      sprocket = SprocketsApplication
    end
    render :text => sprocket.source, :content_type => "text/javascript"
  end
end
