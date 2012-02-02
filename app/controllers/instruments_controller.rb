class InstrumentsController < ApplicationController
  before_filter :set_nocache_header
  before_filter :only_registered
  
  def index
    if request.xhr?
      channels_to_load = params[:channels].split(',') rescue []
      channels = current_user.channels.verified
      render :json => channels.map { |channel|
        Channel.prepare_for_frontend(channel, current_user) if channels_to_load.include?(channel.id.to_s) || channel.has_unread_meeps
      }.compact
    else
      @users = (SystemPreferences.show_only_online_users ? [] : User.registered.all).map {|user| User.prepare_for_frontend(user) }
      @channels = current_user.channels.verified.real
      render :layout => "instruments"
    end
  end
  
  private
    def set_nocache_header
      response.headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate'
      response.headers['Pragma'] = 'no-cache'
      response.headers['Expires'] = 'Fri, 01 Jan 1990 00:00:00 GMT'
    end
end
