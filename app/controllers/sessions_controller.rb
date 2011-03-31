# class SessionsController < ApplicationController
#   prepend_before_filter :require_no_authentication, :only => [ :new, :create ]
#   skip_before_filter    :verify_authenticity_token, :only => [:create]
#   include Devise::Controllers::InternalHelpers
# 
#   # WITH JSON RESPONSE       
#   def sign_in_and_redirect(resource_or_scope, resource=nil, skip=false)
#     scope      = Devise::Mapping.find_scope!(resource_or_scope)
#     resource ||= resource_or_scope
#     sign_in(scope, resource) unless skip
#     respond_to do |format|
#       format.html {redirect_to stored_location_for(scope) || after_sign_in_path_for(resource) }
#       format.json { render :json => {:user_id => resource.id.to_s, :token => resource.communication_token} }
#     end
#   end
# 
#   # GET /resource/sign_in
#   def new
#     build_resource
#     render_with_scope :new
#   end
# 
#   # POST /resource/sign_in
#   def create
#     if resource = authenticate(resource_name)
#       set_flash_message :notice, :signed_in
#       sign_in_and_redirect(resource_name, resource, true)
#     elsif [:custom, :redirect].include?(warden.result)
#       throw :warden, :scope => resource_name
#     else
#       set_now_flash_message :alert, (warden.message || :invalid)
#       clean_up_passwords(build_resource)
#       render_with_scope :new
#     end
#   end
# 
#   # GET /resource/sign_out
#   def destroy
#     set_flash_message :notice, :signed_out if signed_in?(resource_name)
#     sign_out_and_redirect(resource_name)
#   end
# 
#   protected
# 
#     def clean_up_passwords(object)
#       object.clean_up_passwords if object.respond_to?(:clean_up_passwords)
#     end
# end
