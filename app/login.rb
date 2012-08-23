class MobileProtonet < Sinatra::Application

  get '/login' do
    if current_user
      redirect '/'
    else
      erb :login
    end
  end

  post '/login' do
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

  get '/logout' do
    session.clear
    redirect '/'
  end

end