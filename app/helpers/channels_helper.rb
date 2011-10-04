module ChannelsHelper
  def get_channel_mapping_as_json
    channel_mapping = {}
    Channel.real.all.each do |channel|
      channel_mapping[escape_javascript(channel.name)] = channel.id
    end
    channel_mapping.to_json
  end
  
  def channel_description(channel)
    channel.description.blank? ? raw('<i class="hint">no description available</i>') : channel.description
  end
  
  def channel_icons(channel)
    render :partial => 'channel_icons', :locals => { :channel => channel }
  end
end