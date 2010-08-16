class InstrumentsController < ApplicationController
  before_filter :login_required, :except => [:index, :public_dashboard]
  before_filter :set_nocache_header
  
  def index
    logged_in? ? private_dashboard : public_dashboard
  end

  def private_dashboard
    public_dashboard
  end
  
  def public_dashboard
    @channels = current_user.verified_channels
    @asset = Asset.new
    @active_channel = params[:channel_id] ? Channel.find(params[:channel_id]) : @channels.first
    
    render 'public_dashboard'
  end
  
  private
    def set_nocache_header
      response.headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate'
      response.headers['Pragma'] = 'no-cache'
      response.headers['Expires'] = 'Fri, 01 Jan 1990 00:00:00 GMT'
    end
end
