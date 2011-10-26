module ChannelsHelper
  def channel_description(channel, max_length=nil)
    if channel.description.blank?
      raw('<i class="hint">no description available</i>')
    else
      max_length ? truncate(channel.description, { :length => max_length }) : channel.description
    end
  end
  
  def global_channel_class(node, channel)
    if node.url.include?("team.protonet.info") && channel.name.starts_with?("protonet")
      "official-channel"
    end
  end
end