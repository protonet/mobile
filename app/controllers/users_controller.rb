class UsersController < ApplicationController
  filter_resource_access
  include Rabbit
  
  def index
    @active_users = User.find(Meep.connection.select_values("SELECT user_id, count(meeps.id) as counter FROM meeps left outer join users on users.id = meeps.user_id WHERE users.temporary_identifier IS NULL AND (users.id != -1) AND meeps.created_at > '#{(Time.now - 2.weeks).to_s(:db)}' GROUP BY user_id ORDER BY counter DESC, meeps.id DESC LIMIT 20"))
  end
  
  def show
    @user = User.find(params[:id])
    if params[:no_redirect] || !@user.external_profile_url
      render
    else
      return redirect_to(@user.external_profile_url)
    end
  end
  
  def new
    redirect_to_and_preserve_xhr :controller => "registrations", :action => :new
  end
  
  def update
    user_type = params[:user_type]
    user = User.find(params[user_type][:id])
    success = user && (user.update_attributes(params[user_type]) if user.can_edit?(user))
    if success && user.errors.empty?
      flash[:notice] = "Successfully updated user '#{user.login}'"
    else
      flash[:error] = "Could not update user '#{user.login}'"
    end
    redirect_to_and_preserve_xhr :action => 'edit', :id => user.id
  end

  def delete_stranger_older_than_two_days
    if current_user.admin? && User.delete_strangers_older_than_two_days!
      flash[:notice] = "Successfully deleted all old strangers!"
    else
      flash[:error]  = "Couldn't delete old strangers!"
    end
    if request.xhr?
      head(204)
    else
      redirect_to :back
    end
  end
  
  def start_rendezvous
    Channel.setup_rendezvous_for(current_user.id, params[:id].to_i)
    head(204)
  end
  
  def update_last_read_meeps
    unless current_user.stranger?
      mapping = params[:mapping] || {}
      Listen.update_last_read_meeps(current_user.id, mapping)
    end
    head(204)
  end
  
  def update_user_admin_flag
    if current_user.admin? && current_user.valid_password?(params[:admin_password])
      user = User.find(params[:user_id])
      if params[:admin] == 'true'
        user.add_to_role(:admin)
        flash[:notice] = "Successfully made '#{user.login}' an admin!"
      else
        user.remove_from_role(:admin)
        flash[:notice] = "Successfully removed '#{user.login}' from the list of admins!"
      end
      
      redirect_to_edit_after_update(user)
    else
      flash[:error] = "The admin password is wrong"
      head(403)
    end
  end
  
  def generate_new_password
    if current_user.admin? && current_user.valid_password?(params[:admin_password])
      user = User.find(params[:user_id])
      new_password  = User.pronouncable_password
      user.password = new_password
      if params[:send_email]
        flash[:sticky] = "Generated new password for #{user.login}, email has been sent." if user.save && Mailer.password_reset(new_password, user).deliver
      else
        flash[:sticky] = "Generated new password for #{user.login}: \"#{new_password}\" please remind him to change it." if user.save
      end
    else
      flash[:error]  = "You're not authorized to do this, please check your password and admin rights."
    end
    
    redirect_to_edit_after_update(user)
  end
  
  def change_password
    @user = User.find(params[:id])
    @user.errors.add(:password_confirmation, 'does not match your new password') if params[:password] != params[:password_confirmation]
    if current_user.can_edit?(@user) && @user.errors.empty? && @user.update_with_password(params)
      sign_in(@user, :bypass => true)
      flash[:notice] = "You've successfully changed your password!"
      publish "users", @user.id, { :trigger => 'user.changed_password' }
    else
      flash[:error]  = "There was an error changing you password: #{@user.errors.full_messages.to_sentence}."
    end
    redirect_to_edit_after_update(@user)
  end
  
  def delete
    user = User.find(params[:user_id])
    if current_user.admin? && current_user != user
      user.destroy && flash[:notice] = "You have deleted the user #{user.login}!"
    end
    redirect_to :action => 'index'
  end
  
  def meeps_with_text_extension
    @meeps = Meep.where(:channel_id => current_user.channels.verified.map(&:id)).
                  where(:user_id => params[:id]).
                  where("text_extension != ''").
                  includes(:user).
                  order(:id => "DESC").
                  all(:limit => 25)
    render :json => Meep.prepare_for_frontend(@meeps)
  end
  
  def search
    @user = User.find(params[:search_term]) rescue User.find_by_login(params[:search_term]) rescue nil
    if @user
      redirect_to user_path(@user)
    else
      flash[:error] = "Couldn't find user with identifier '#{params[:search_term]}'"
      redirect_to_and_preserve_xhr :index
    end
  end
  
  def remove_newbie_flag
    current_user.update_attribute(:newbie, false)
    head(204)
  end
  
  def newbie_todo_list
    render :json => {
      'change-password' => !current_user.valid_password?('admin'),
      'upload-avatar'   => current_user.avatar.file?,
      'create-channel'  => current_user.channels.real.size > 1,
      'invite-user'     => User.registered.size > 1,
      'write-meep'      => Meep.find_all_by_user_id(current_user.id).size > 0
    }
  end
  
  private
    def redirect_to_edit_after_update(user)
      if request.xhr?
        head(204)
      else
        redirect_to_and_preserve_xhr :action => 'edit', :id => user.id
      end
    end
end
