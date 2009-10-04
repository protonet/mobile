class ChannelsController < ApplicationController
  
  before_filter :login_required
  
  def index
    @channel = Channel.all
  end
  
end
