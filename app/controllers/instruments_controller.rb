class InstrumentsController < ApplicationController
  before_filter :set_nocache_header
  before_filter :only_registered
  
  def index
    @subscribed_channels = current_user.channels.verified.real
    render :layout => "instruments"
  end
end
