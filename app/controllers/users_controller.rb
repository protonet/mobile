class UsersController < ApplicationController
  include Rabbit
  
  filter_resource_access :collection => [:index, :my, :channels, :info]
  
  before_filter :redirect_to_my_profile,  :only => :show
  before_filter :prepare_target_users,    :only => [:send_system_message, :send_javascript]
  after_filter  :publish_admin_users,     :only => :update_user_admin_flag
  
  def index
  end
  
  def show
    user = User.find(params[:id])
    render_profile_for user
  end
  
  def info
    users = User.registered
    users_to_load = params[:ids].split(',') rescue users.each {|u| u.id.to_s }
    
    respond_to do |format|
      format.json do
        render :json => users.map { |channel|
          next unless users_to_load.include?(user.id.to_s)
          User.prepare_for_frontend(user)
        }.compact
      end
    end
  
  end
  def my
    render_profile_for current_user
  end
  
  def new
    xhr_redirect_to :controller => "registrations", :action => :new
  end
  
  def update
    user_type = params[:user_type]
    user = User.find(params[user_type][:id])
    success = user && (user.update_attributes(params[user_type]) if user.can_edit?(user))
    if success && user.errors.empty?
      flash[:notice] = "Successfully updated user"
    else
      flash[:error] = "Could not update user: #{user.errors.full_messages.to_sentence}"
    end
    xhr_redirect_to :action => 'edit', :id => user.id
  end
  
  def channels
    channels = current_user.channels.verified
    channels_to_load = params[:channels].split(',') rescue []
    
    respond_to do |format|
      format.json do
        render :json => channels.map { |channel|
          Channel.prepare_for_frontend(channel, current_user, true) if channels_to_load.include?(channel.id.to_s) || channel.has_unread_meeps
        }.compact
      end
    end
  end
  
  def delete_stranger_older_than_two_days
    if current_user.admin? && User.delete_strangers_older_than_two_days!
      flash[:notice] = "Successfully deleted all old strangers!"
    else
      flash[:error]  = "Couldn't delete old strangers!"
    end
    respond_to_preference_update
  end
  
  def start_rendezvous
    Channel.setup_rendezvous_for(current_user.id, params[:id].to_i)
    render :nothing => true
  end
  
  def update_last_read_meeps
    unless current_user.stranger?
      mapping = params[:mapping] || {}
      Listen.update_last_read_meeps(current_user.id, mapping)
    end
    render :nothing => true
  end
  
  def update_user_admin_flag
    if current_user.admin? && current_user.valid_password?(params[:admin_password])
      user = User.find(params[:user_id])
      if params[:admin] == 'true'
        user.add_to_role('admin')
        flash[:notice] = "Successfully made '#{user.login}' an admin!"
      else
        user.remove_from_role('admin')
        flash[:notice] = "Successfully removed '#{user.login}' from the list of admins!"
      end
      
      respond_to_user_update(user)
    else
      flash[:error] = "The admin password is wrong"
      head(403)
    end
  end
  
  def update_roles
    if current_user.admin?
      user = User.find(params[:user_id])
      selected_roles = params[:user][:roles].reject {|role| role == "admin" || role.blank?}
      selected_roles = Role.find(selected_roles)
      selected_roles.push(Role.find_by_title("admin")) if user.admin?
      user.roles = selected_roles
      flash[:notice] = "Successfully update roles!"
      respond_to_user_update(user)
    else
      flash[:error] = "Only admins can do that!"
      head(403)
    end
  rescue
    flash[:error] = "Could not update the roles, sorry."
    head(403)
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
      flash[:error]  = "You are not authorized to do this, please check your password and admin rights."
    end
    
    respond_to_user_update(user)
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
    respond_to_user_update(@user)
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
                  order("meeps.id DESC").
                  includes(:user).
                  all(:limit => 20)
    render :json => Meep.prepare_for_frontend(@meeps)
  end
  
  def search
    @user = User.find_by_id_or_login(params[:search_term])
    if @user
      xhr_redirect_to :controller => :users, :action => :show, :id => @user.id
    else
      flash[:error] = "Couldn't find user with identifier '#{params[:search_term]}'"
      xhr_redirect_to :controller => :users, :action => :index
    end
  end
  
  def remove_newbie_flag
    current_user.update_attribute(:newbie, false)
    render :nothing => true
  end
  
  def newbie_todo_list
    render :json => {
      'change-password' => !current_user.valid_password?('admin'),
      'upload-avatar'   => current_user.avatar.file?,
      'create-channel'  => current_user.channels.real.local.without_system.size > 1,
      'invite-user'     => User.registered.size > 1,
      'write-meep'      => Meep.find_all_by_user_id(current_user.id).size > 0
    }
  end
  
  def send_javascript
    @target_users.each {|u| publish("users", u.id, { :eval => params[:javascript] }) }
    flash[:notice] = 'The javascript has been executed'
    respond_to_preference_update
  end
  
  def send_system_message
    @target_users.each {|u| publish("users", u.id, { :eval => "protonet.trigger('flash_message.sticky', '#{params[:message]}')" }) }
    flash[:notice] = 'The system message has been sent'
    respond_to_preference_update
  end
  
  private
    def render_profile_for(user)
      @user = user
      if params[:no_redirect] || !@user.external_profile_url
        render :show
      else
        redirect_to(@user.external_profile_url)
      end
    end
    
    def redirect_to_my_profile
      xhr_redirect_to(:controller => :users, :action => :my) if current_user.id == params[:id].to_i
    end
  
    def publish_admin_users
      admin_ids = User.admins.map(&:id)
      publish "system", "users", { :trigger => 'users.update_admin_status', :admin_ids => admin_ids }
    end
    
    def prepare_target_users
      @target_users = params[:target_all] ? User.registered : User.find_by_id_or_login(params[:target]).to_a
    end
    
    def respond_to_user_update(user)
      if request.xhr?
        head(204)
      else
        xhr_redirect_to :action => 'edit', :id => user.id
      end
    end
end
