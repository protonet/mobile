class ListensController < ApplicationController
  
  before_filter :login_required
  
  def create
    audience = Audience.find(params[:audience_id])
    if audience
      current_user.audiences << audience
      current_user.save
      flash[:notice] = "you started listening to #{audience.name}"
    else
      flash[:error] = "could not subscribe to audience with id #{params[:audience_id].to_s}"
    end
    redirect_to :controller => 'audiences'
  end
  
  def destroy
    if listen = begin Listen.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        nil
      end
      audience = listen.audience
      listen.destroy
      flash[:notice] = "you stopped listening to #{audience.name}"
    end
    redirect_to :controller => 'audiences', :action => 'index'
  end
  
end
