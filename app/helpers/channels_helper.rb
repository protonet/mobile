module ChannelsHelper
  def channel_description(channel)
    channel.description.blank? ? raw('<i class="hint">no description available</i>') : channel.description
  end
  
  def channel_icons(channel)
    render :partial => 'channel_icons', :locals => { :channel => channel }
  end
end