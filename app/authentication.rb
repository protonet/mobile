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

  get '/reset_password'do
    erb :reset_password
  end

  get '/sign_up'do
    erb :sign_up
  end

end