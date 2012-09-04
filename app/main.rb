class MobileProtonet < Sinatra::Application 

  get '/' do
    if current_user
      erb :index
    else
      redirect '/sign_in'
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
        :global => channel.global,
        :rendezvous => channel.rendezvous
      }
    end.to_json
  end

  get '/users' do
    content_type :json
    protonet.users.map do |user| 
      {
        :id => user.id,
        :name => user.login,
        :avatar => user.avatar_url
      }
    end.to_json
  end

  post '/rendezvous' do
    content_type :json
    channel = protonet.create_rendezvous(current_user.id, params[:user_id])
    if channel.id
      { :channel_id => channel.id }.to_json
    else
      { :channel_id => nil }.to_json
    end
  end

end
