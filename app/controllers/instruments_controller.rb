class InstrumentsController < ApplicationController
  before_filter :set_nocache_header
  before_filter :only_registered
  
  def index
    @channels = current_user.verified_real_channels
    if request.xhr?
      render :json => @channels.map { |channel|
        Channel.prepare_for_frontend(channel)
      }
    end
  end
  
  private
    def set_nocache_header
      response.headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate'
      response.headers['Pragma'] = 'no-cache'
      response.headers['Expires'] = 'Fri, 01 Jan 1990 00:00:00 GMT'
    end
end
