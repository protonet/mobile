class FilesController < ApplicationController
  include Rabbit
  
  def index
  end
  
  def play
    render 'play', :layout => false
  end

end
