module ChannelsHelper

  def channel_listen_control(channel)
    if current_user.channels.include?(channel)
      link_to('OFF', current_user.listens.find_by_channel_id(channel.id), :class => 'listen off', :method => :delete)
    else
      link_to('ON', listens_path(:channel_id => channel.id), :class => 'listen on', :method => :post)
    end
  end

end