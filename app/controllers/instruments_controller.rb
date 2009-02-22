class InstrumentsController < ApplicationController

  before_filter :login_required, :except => [:index, :public_dashboard]
  
  def index
    logged_in? ? private_dashboard : public_dashboard
  end

  def private_dashboard
    render :text => 'private'
  end
  
  def public_dashboard
    render :text => 'public'
  end

end
