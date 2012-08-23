class MobileProtonet < Sinatra::Application 

  get '/' do
    if current_user
      erb :index
    else
      redirect '/login'
    end
  end

  get '/account' do
    erb :account
  end

  get '/channels/subscribed' do
    content_type :json
    current_user.subscribed_channels.map do |channel|
      {
        :name => channel.name,
        :id => channel.id,
        :uuid => channel.uuid,
        :description => channel.description,
        :global => channel.global
      }
    end.to_json
  end

end
