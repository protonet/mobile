class FilesController < ApplicationController
  include Rabbit
  
  #filter_resource_access
  
  def index
  end
  
  def play
    render 'play', :layout => false
  end

end
