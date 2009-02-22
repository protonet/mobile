class InstrumentsController < ApplicationController

  before_filter :login_required, :except => [:index, :public_dashboard]
  
  def index
    logged_in? ? private_dashboard : public_dashboard
  end

  def private_dashboard
    render 'private_dashboard'
  end
  
  def public_dashboard
    render 'public_dashboard'
  end

end
