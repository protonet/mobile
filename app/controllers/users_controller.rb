class UsersController < ApplicationController 
  
  before_filter :only_registered, :except => [:new, :create]
  
  def index
    @users = User.registered
    @strangers_count = User.strangers.count
  end

  def show
    render :partial => "user_details", :locals => {:user => User.find(params[:id])}
  end
  
  def new
    redirect_to :controller => "registrations", :action => :new
  end
  
  def update
    user = User.find(params[:user][:id])
    success = user && (user.update_attributes(params[:user]) if user.can_edit?(user))
    if success && user.errors.empty?
      flash[:notice] = "Successfully updated user '#{user.login}'"
    else
      flash[:error] = "Could not update user '#{user.login}'"
    end
    redirect_to :action => 'index', :anchor => user.id
  end

  def delete_stranger_older_than_two_days
    if current_user.admin? && User.delete_strangers_older_than_two_days!
      flash[:notice] = "Successfully deleted all old strangers!"
    else
      flash[:error]  = "Couldn't delete old strangers!"
    end
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
  
  def update_user_admin_flag
    if current_user.admin? && current_user.valid_password?(params[:admin_password])
      user = User.find(params[:user_id])
      if params[:admin] == 'true'
        user.add_to_role(:admin)
        flash[:notice] = "Successfully made #{user.login} an admin!"
      else
        user.remove_from_role(:admin)
        flash[:notice] = "Successfully removed #{user.login} from the list of admins!"
      end
    end
    redirect_to :action => 'index', :anchor => params[:user_id]
  end
  
  def generate_new_password
    if current_user.admin? && current_user.valid_password?(params[:admin_password])
      user = User.find(params[:user_id])
      new_password  = @template.pronoucable_password
      user.password = new_password
      flash[:sticky] = "Generated new password for #{user.login}: \"#{new_password}\" please remind him to change it." if user.save
    end
    redirect_to :action => 'index', :anchor => params[:user_id]
  end
  
  def change_password
    @user = current_user
    @user.errors.add(:password_confirmation, 'does not match your new password') if params[:password] != params[:password_confirmation]
    if @user.errors.empty? && @user.update_with_password(params)
      flash[:notice] = "You've successfully changed your password!"
    else
      flash[:error]  = "There was an error changing you password: #{@user.errors.full_messages.to_sentence}."
    end
    redirect_to :back
  end
  
  def delete
    user = User.find(params[:user_id])
    if current_user.admin? && current_user != user
      user.destroy && flash[:notice] = "You have deleted the user #{user.login}!"
    end
    redirect_to :action => 'index'
  end
  
end
