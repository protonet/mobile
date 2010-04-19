class UsersController < ApplicationController  
  def index
    @users = User.all
  end

  def show
    @user = User.find(params[:id])
    @avatar = @user.avatar

    respond_to do |format|
      format.html do
        if @user == current_user
          render 'show_for_owner'
        else
          render 'show'
        end
      end# show.html.erb
      format.xml { render :xml => @user }
    end
  end

  # render new.rhtml
  def new
    @user = User.new
  end

  def create
    logout_keeping_session!
    @user = User.new(params[:user])
    success = @user && @user.save
    if success && @user.errors.empty?
      # Protects against session fixation attacks, causes request forgery
      # protection if visitor resubmits an earlier form using back
      # button. Uncomment if you understand the tradeoffs.
      # reset session
      self.current_user = @user # !! now logged in
      redirect_back_or_default('/')
      flash[:notice] = "Thanks for signing up!  We're sending you an email with your activation code."
    else
      flash[:error]  = "We couldn't set up that account, sorry.  Please try again, or contact an admin (link is above)."
      redirect_to :action => 'new'
    end
  end

  def update
    user = User.find(params[:user][:id])
    success = user && user.update_attributes(params[:user])
    if success && user.errors.empty?
      flash[:notice] = "Successfully updated user '#{params[:user][:name]}'"
    else
      flash[:error] = "Could not update user '#{params[:user][:name]}'"
    end
    redirect_to :action => 'index'
  end

  def delete_stranger_older_than_two_days
    User.delete_strangers_older_than_two_days!
    redirect_to :action => 'index'
  end

  def list_channels
    channels = current_user ? current_user.channels : [Channel.home]
    respond_to do |format|
      format.json do
        channels = channels.collect { |c| {:id => c.id, :name => c.name, :description => c.description}}
        render :json => {:channels => channels}
      end
    end
  end

end
