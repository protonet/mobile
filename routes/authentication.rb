class MobileProtonet < Sinatra::Application

  get '/sign_in' do
    if current_user
      redirect '/'
    else
      erb :sign_in
    end
  end

  post '/sign_in' do
    response = Protolink::Protonet.open(settings.api_url, params[:user][:login], params[:user][:password]).auth
    content_type :json
    if response
      puts response.inspect
      session[:login] = params[:user][:login]
      session[:password] = params[:user][:password]
      session[:user] = JSON.parse(response.body)
      {:success => true}.to_json
    else
      {:success => false, :message => "Your credentials are invalid"}.to_json
    end
  end

  get '/sign_out' do
    session.clear
    redirect '/'
  end

  get '/users/password/edit' do
    @reset_password_token = params[:reset_password_token]
    erb :edit_password
  end

  post '/users/password' do
    response = Protolink::Protonet.open(settings.api_url, nil, nil).reset_password!(
      params[:user][:reset_password_token],
      params[:user][:password],
      params[:user][:password_confirmation]
    )
    content_type :json
    if response
      session[:user] = JSON.parse(response.body)
      session[:login] = session[:user]["login"]
      session[:password] = params[:user][:password]
      redirect '/'
    else
      {:success => false, :message => "The reset token was not valid."}.to_json
    end
  end

  get '/users/password/reset'do
    erb :reset_password
  end

  post '/users/password/reset' do
    response = Protolink::Protonet.open(settings.api_url, nil, nil).reset_password(params[:user][:email], request.env['HTTP_HOST'])
    content_type :json

    if response
      {:success => true, :message => "You will recieve an email how to reset your password"}.to_json
    else
      {:success => false, :message => "Sorry we don't know this email"}.to_json
    end

  end

  get '/sign_up'do
    erb :sign_up
  end

end