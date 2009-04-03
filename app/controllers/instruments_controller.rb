class InstrumentsController < ApplicationController

  before_filter :login_required, :except => [:index, :public_dashboard]
  
  def index
    logged_in? ? private_dashboard : public_dashboard
  end

  def private_dashboard
    public_dashboard
  end
  
  def public_dashboard
    @audiences = Audience.all
    @active_audience = params[:audience_id] ? Audience.find(params[:audience_id]) : Audience.home
    
    @tweets = @active_audience.tweets.recent
    render 'public_dashboard'
  end

end
