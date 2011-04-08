class ApiV1::MasterController < ApplicationController
  
  before_filter :authenticate
  
  def authenticate
    authenticate_or_request_with_http_basic("VersaCommerce API") do |username, password|
      
      user = User.find_by_login(username) rescue nil
      @current_user = user if user && user.valid_password?(password)


      # password can be api key or user password
      
      
      # unless application_key.blank? or password.blank?
      #   @app  = App.find_by_application_key(application_key)
      #   if @app
      #     registration = @shop_or_mall.app_registrations.find_by_app_id(@app.id)
      #     if registration
      #       computed_password = Digest::MD5.hexdigest(@app.shared_key + registration.token)
      #       computed_password == password
      #     end
      #   end
      # end
    end

  end
  
end
