class UsersController < ApplicationController 
   
  def index
    @users = User.all
  end

  def show
    render :partial => "user_details", :locals => {:user => User.find(params[:id])}
  end

  # render new.rhtml
  def new
    @user = User.new
    render :template => "sessions/_registration_box"
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
      
      flash[:notice] = "Thanks for signing up, #{@user.display_name}!"
    else
      @user ||= User.new
      flash[:error]  = "Sorry, but we couldn't set up that account. Please try again."
    end
    
    redirect_back_or_default('/')
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
    channels = current_user ? current_user.verified_channels : [Channel.home]
    respond_to do |format|
      format.json do
        channels = channels.collect { |c| {:id => c.id, :name => c.name, :description => c.description, :uuid => c.uuid}}
        render :json => {:channels => channels}
      end
    end
  end
  
  def request_admin_flag
    case current_user.make_admin(params[:key])
    when :ok
      flash[:notice] = "woot! you're an admin now!"
    when :admin_already_set
      flash[:error] = 'already done you need to reset with rake'
    when :key_error
      flash[:error] = 'you entered an invalid key'
    else
      flash[:error] = 'error! BAM!'
    end
    redirect_to :back
  end
  
  def change_password
    error = nil
    if current_user == User.authenticate(current_user.login, params[:current_password])
      error = 'confirmation did not match new password' unless current_user.reset_password(params[:new_password], params[:new_password_verification])
    else
      error = 'bad current password entered'
    end
    error ? flash[:error]  = "There was an error changing you password: #{error}." : flash[:notice] = "You've succesfully changed your password!"
    redirect_to :back
  end

end
