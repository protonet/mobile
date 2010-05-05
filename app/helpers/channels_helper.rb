module ChannelsHelper

  def channel_listen_control(channel)
    if current_user.channels.include?(channel)
      link_to('<p id="channel-listener"> stop listening </p>', current_user.listens.find_by_channel_id(channel.id), :class => 'listen off', :method => :delete)
    else
      link_to('<p id="channel-listener"> start listening </p>', listens_path(:channel_id => channel.id), :class => 'listen on', :method => :post)
    end
  end

end
