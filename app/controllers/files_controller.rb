class FilesController < ApplicationController
  include Rabbit
  
  before_filter :only_registered
  
  def index
  end
  
  def play
    render 'play', :layout => false
  end

end
