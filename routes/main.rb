class MobileProtonet < Sinatra::Application 

  get '/' do
    require_authentication
    erb :index
  end

  get '/channels/:id' do
    require_authentication
    content_type :json
    channel = protonet.find_channel(params[:id])
    {
      :id => channel.id,
      :name => channel.name,
      :description => channel.description,
      :global => channel.global,
      :uuid => channel.uuid,
      :rendezvous => channel.rendezvous
    }.to_json
  end

  get '/channels/:channel_id/meeps' do
    require_authentication
    content_type :json
    protonet.find_meeps_by_channel(params[:channel_id], params[:limit], params[:offset]).map do |meep|
      {
        :id         => meep.id,
        :channel_id => meep.channel_id,
        :author     => meep.author,
        :avatar     => meep.avatar,
        :created_at => meep.created_at,
        :message    => meep.message,
        :user_id    => meep.user_id,
        :text_extension => meep.text_extension
      }
    end.to_json
  end

  get '/channels/subscribed' do
    require_authentication
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
    require_authentication
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
    require_authentication
    content_type :json
    channel = protonet.create_rendezvous(current_user.id, params[:user_id])
    if channel.id
      { :channel_id => channel.id }.to_json
    else
      { :channel_id => nil }.to_json
    end
  end

end
