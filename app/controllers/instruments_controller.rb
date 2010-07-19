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
    @channels = current_user.channels
    @asset = Asset.new
    @active_channel = params[:channel_id] ? Channel.find(params[:channel_id]) : @channels.first
    
    respond_to do |format|
      format.json do
        get_meeps_as_json(@channels)
      end
      format.html do
        render 'public_dashboard'
      end
    end
  end
  
  private
    def set_nocache_header
      response.headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate'
      response.headers['Pragma'] = 'no-cache'
      response.headers['Expires'] = 'Fri, 01 Jan 1990 00:00:00 GMT'
    end
    
    def get_meeps_as_json(channels)
      render :json => channels.map { |channel|
        tweets = channel.tweets.recent.all(:limit => 25, :include => [:avatar])
        tweets = tweets.map do |t|
          t.text_extension = JSON.parse(t.text_extension) rescue nil
          t.attributes.merge({ :avatar => t.user.active_avatar_url })
        end
        
        { :id => channel.id, :name => channel.name, :meeps  => tweets }
      }.to_json
    end
end
