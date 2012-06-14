class FilesController < ApplicationController
  include Rabbit
  
  before_filter :only_registered
  
  #filter_resource_access
  
  def index
  end
  
  def play
    render 'play', :layout => false
  end

end
