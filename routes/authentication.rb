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
    @reset_passwort_token = params[:reset_passwort_token]
    erb :edit_password
  end

  get '/reset_password'do
    erb :reset_password
  end

  post '/reset_password' do
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