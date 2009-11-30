class InstrumentsController < ApplicationController

  before_filter :login_required, :except => [:index, :public_dashboard]
  
  def index
    logged_in? ? private_dashboard : public_dashboard
  end

  def private_dashboard
    public_dashboard
  end
  
  def public_dashboard
    @channels = current_user.channels
    @asset = Asset.new
    @active_channel = params[:channel_id] ? Channel.find(params[:channel_id]) : Channel.home
    
    render 'public_dashboard'
  end

end
