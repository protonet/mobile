class InstrumentsController < ApplicationController

  before_filter :login_required

  def index
    render :text => 'foobar'
  end

end
