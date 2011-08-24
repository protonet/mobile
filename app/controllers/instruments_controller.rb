class InstrumentsController < ApplicationController
  before_filter :set_nocache_header
  before_filter :only_registered
  
  def index
    if request.xhr?
      channels_to_load = params[:channels].split(',') rescue []
      channels = current_user.verified_channels
      render :json => channels.map { |channel|
        channels_to_load.include?(channel.id.to_s) ? Channel.prepare_for_frontend(channel) : nil
      }.compact
    else
      @channels = current_user.verified_real_channels
    end
  end
  
  private
    def set_nocache_header
      response.headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate'
      response.headers['Pragma'] = 'no-cache'
      response.headers['Expires'] = 'Fri, 01 Jan 1990 00:00:00 GMT'
    end
end
