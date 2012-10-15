class MobileProtonet < Sinatra::Application

  get '/sign_in' do
    if current_user
      redirect '/mobile'
    else
      erb :sign_in
    end
  end

  post '/sign_in' do
    warden.logout if session["warden.user.user.key"]
    warden.authenticate!
    content_type :json
    {:redirect => "/mobile"}.to_json
  end

  post '/unauthenticated/?' do
    status 401
  end

  get '/sign_out' do
    warden.logout
    session.clear
    redirect '/mobile'
  end

  get '/users/password/edit' do
    @reset_password_token = params[:reset_password_token]
    erb :edit_password
  end

  post '/users/password' do
    response = Protolink::Protonet.open(settings.api_url).reset_password!(
      params[:user][:reset_password_token],
      params[:user][:password],
      params[:user][:password_confirmation]
    )
    content_type :json
    if response
      session[:user] = response.body
      session[:login] = response.body["login"]
      session[:password] = params[:user][:password]
      {:redirect => "/mobile"}.to_json
    else
      {:success => false, :message => "The reset token was not valid."}.to_json
    end
  end

  get '/users/password/reset' do
    erb :reset_password
  end

  post '/users/password/reset' do
    response = Protolink::Protonet.open(settings.api_url).reset_password(params[:user][:email], request_host)
    content_type :json
    if response
      {:success => true, :message => "You will recieve an email how to reset your password"}.to_json
    else
      {:success => false, :message => "Sorry we don't know this email"}.to_json
    end

  end

  # get '/sign_up' do
  #   erb :sign_up
  # end
# 
  # post '/sign_up' do
  #   response = Protolink::Protonet.open(settings.api_url).sign_up(params)
  #   unless response[:errors]
  #     session[:user] = response.body
  #     session[:login] = JSON.parse(response.body)["login"]
  #     session[:password] = params[:user][:password]
  #     {:redirect => '/'}.to_json
  #   else
  #     content_type :json
  #     {:errors => eval(response[:errors])}.to_json
  #   end
  # end

end