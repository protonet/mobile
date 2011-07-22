class Api::V1::MasterController < ActionController::Base
  
  before_filter :authenticate
  
  def authenticate
    authenticate_or_request_with_http_basic("protonet API") do |username, password|
      user = User.find_by_login(username) rescue nil
      @current_user = user if user && user.valid_password?(password)
    end

  end
  
end
