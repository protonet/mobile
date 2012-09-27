class UsersController < ApplicationController
  include Rabbit
  
  filter_resource_access :additional_member => [:generate_new_password, :update_roles, :change_password], :collection => [:index, :my_profile, :channels, :info, :search]
  
  before_filter :redirect_to_my_profile,  :only => :show
  before_filter :prepare_target_users,    :only => :send_javascript
  after_filter  :publish_admin_users,     :only => :update_roles
  
  def index
    @nav = "users"
    @users = User.registered.includes(:roles).order_by_login.paginate(:page => params[:page], :per_page => 40)
    respond_to do |format|
      format.html {
        render
      }
      format.js {
        render :partial => "user", :collection => @users
      }
    end
  end
  
  def show
    @nav = "users"
    user = User.find(params[:id])
    render_profile_for user
  end
  
  def info
    users = User.registered
    users_to_load = params[:ids].split(',') rescue users.each {|u| u.id.to_s }
    
    respond_to do |format|
      format.json do
        render :json => users.map { |user|
          next unless users_to_load.include?(user.id.to_s)
          User.prepare_for_frontend(user)
        }.compact
      end
    end
  
  end
  
  def my_profile
    @nav = "my_profile"
    render_profile_for current_user
  end
  
  def new
    redirect_to :controller => "registrations", :action => :new
  end
  
  def edit
    @nav = if current_user == @user
        "my_profile" 
      else
        "users"
      end
  end
  
  def update
    user_type = params[:user_type]
    user = User.find(params[user_type][:id])
    success = user && (user.update_attributes(params[user_type]) if user.can_edit?(user))
    if success && user.errors.empty?
      flash[:notice] = t("users.flash_message_update_success")
    else
      flash[:error] = t("users.flash_message_update_error", :errors => user.errors.full_messages.to_sentence)
    end
    redirect_to :action => 'edit', :id => user.id
  end
  
  def channels
    channels = current_user.channels.verified
    channels_to_load = params[:channels].split(',') rescue []
    
    respond_to do |format|
      format.json do
        render :json => channels.map { |channel|
          Channel.prepare_for_frontend(channel, true) if channels_to_load.include?(channel.id.to_s) || channel.has_unread_meeps
        }.compact
      end
    end
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
  
  def update_roles
    user = User.find(params[:user_id])
    
    user.roles = case params[:role]
      when 'admin'
        flash[:notice] = t("users.flash_message_admin_success", :display_name => user.display_name)
        [Role.find_by_title('user'), Role.find_by_title('admin')]
      when 'user'
        flash[:notice] = t("users.flash_message_user_success", :display_name => user.display_name)
        [Role.find_by_title('user')]
      else
        flash[:notice] = t("users.flash_message_invitee_success", :display_name => user.display_name)
        [Role.find_by_title('invitee')]
    end
    
    respond_to_user_update(user)
  end
  
  def generate_new_password
    user = User.find(params[:user_id])
    new_password  = User.pronouncable_password
    user.password = new_password
    if params[:send_email]
      flash[:sticky] = t("users.flash_message_new_password_sent_success", :display_name => user.display_name, :new_password => new_password) if user.save && Mailer.password_reset(new_password, user).deliver
    else
      flash[:sticky] = t("users.flash_message_new_password_success", :display_name => user.display_name, :new_password => new_password) if user.save
    end
    
    respond_to_user_update(user)
  end
  
  def change_password
    @user = User.find(params[:id])
    if current_user.can_edit?(@user) && @user.errors.empty? && @user.update_with_password(params)
      sign_in(@user, :bypass => true)
      flash[:notice] = t("users.flash_message_change_password_success")
      publish "users", @user.id, { :trigger => 'user.changed_password' }
    else
      flash[:error]  = "#{@user.errors.full_messages.to_sentence}."
    end
    respond_to_user_update(@user)
  end
  
  def delete
    user = User.find(params[:user_id])
    if current_user.admin? && current_user != user
      user.destroy && flash[:notice] = t("users.flash_message_destroy_success", :display_name => user.display_name)
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
    render :json => Meep.prepare_many_for_frontend(@meeps)
  end
  
  def search
    @nav = "users"
    @users = User.registered.includes(:roles).order_by_login.where("login like '#{params[:search_term]}%'").paginate(:page => params[:page], :per_page => 40)
    respond_to do |format|
      format.html {
        render :action  => "index"
      }
      format.js {
        render :partial => "user", :collection => @users
      }
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
    flash[:notice] = t("users.flash_message_send_javascript_success")
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
      redirect_to(:controller => :users, :action => :my_profile) if current_user.id == params[:id].to_i
    end
  
    def publish_admin_users
      admin_ids = User.admins.map(&:id)
      publish "system", "users", { :trigger => 'users.update_admin_status', :admin_ids => admin_ids }
    end
    
    def prepare_target_users
      @target_users = params[:target_all] ? User.registered : [User.find_by_id_or_login(params[:target])].compact
    end
    
    def respond_to_user_update(user)
      if request.xhr?
        head(204)
      else
        redirect_to :action => 'edit', :id => user.id
      end
    end
end
