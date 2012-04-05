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
      @channels = current_user.channels.verified.real
      render :layout => "instruments"
    end
  end
end
