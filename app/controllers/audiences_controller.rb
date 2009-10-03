class AudiencesController < ApplicationController
  
  before_filter :login_required
  
  def index
    @audiences = Audience.all
  end
  
end
