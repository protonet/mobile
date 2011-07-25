class InstrumentsController < ApplicationController
  before_filter :set_nocache_header
  before_filter :only_registered
  
  def index
    @channels = current_user.verified_channels
    if request.xhr?
      return get_meeps_as_json(@channels)
    end
  end
  
  private
    def set_nocache_header
      response.headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate'
      response.headers['Pragma'] = 'no-cache'
      response.headers['Expires'] = 'Fri, 01 Jan 1990 00:00:00 GMT'
    end
    
    # TODO -> this doesn't belong here, move to meeps controller
    def get_meeps_as_json(channels)
      render :json => channels.map { |channel|
        meeps = channel.meeps.recent.all(:limit => 25)
        
        { :id => channel.id, :name => channel.name, :meeps  => Meep.prepare_for_frontend(meeps, { :channel_id => channel.id }) }
      }.to_json
    end
end
