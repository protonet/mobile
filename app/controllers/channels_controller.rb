class ChannelsController < ApplicationController
  
  before_filter :login_required
  
  def index
    @channels = Channel.all
  end
  
end
