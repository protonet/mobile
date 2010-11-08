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
    sign_out(:user)
    @user = User.new(params[:user])
    success = @user && @user.save
    if success && @user.errors.empty?
      sign_in(@user)
      # Protects against session fixation attacks, causes request forgery
      # protection if visitor resubmits an earlier form using back
      # button. Uncomment if you understand the tradeoffs.
      # reset session
      
      flash[:notice] = "Thanks for signing up, #{@user.display_name}!"
    else
      @user ||= User.new
      flash[:error]  = "Sorry, but we couldn't set up that account. Please try again."
    end
    
    redirect_to('/')
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
  
  def make_user_admin
    if current_user.admin? && current_user.valid_password?(params[:admin_password])
      
    end
    redirect_to :action => 'index', :anchor => params[:user_id]
  end
  
  def generate_new_password
    if current_user.admin? && current_user.valid_password?(params[:admin_password])
      
    end
    redirect_to :action => 'index', :anchor => params[:user_id]
  end
  
  def change_password
    @user = current_user
    @user.errors.add(:password_confirmation, 'does not match your new password') if params[:password] != params[:password_confirmation]
    if @user.errors.empty? && @user.update_with_password(params)
      flash[:notice] = "You've succesfully changed your password!"
    else
      flash[:error]  = "There was an error changing you password: #{@user.errors.full_messages.to_sentence}."
    end
    redirect_to :back
  end

end
