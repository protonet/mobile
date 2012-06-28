/**
 * Auto completion for users and channels
 */
protonet.timeline.Form.extensions.AutoCompleter = function(input) {
  var autoCompleter = new protonet.ui.InlineAutocompleter(input, [], {
    maxChars: 2,
    prefix:   "@"
  });
  
  function collectData(channelId) {
    var users         = protonet.data.User.getCache(),
        channels      = protonet.data.Channel.getCache(),
        userNames     = [],
        channelNames  = [];
    
    $.each(users, function(i, user) {
      if (user.isStranger && !user.isOnline) {
        return;
      }
      
      // Don't add remote users to autocompleter when in local channels
      if (channelId && !protonet.data.Channel.isGlobal(channelId) && user.isRemote) {
        return;
      }
      
      if (user.isOnline) {
        userNames.unshift(user.name);
      } else {
        userNames.push(user.name);
      }
    });
    
    $.each(channels, function(i, channel) {
      if (!channel.rendezvous) {
        channelNames.push(channel.name);
      }
    });
    
    autoCompleter.setData(userNames.concat(channelNames));
  }
  
  protonet.after("channel.created user.created channel.updated users.update_status", function() {
    collectData();
  });
  
  protonet.after("channel.change", function(channelId) {
    collectData(channelId);
  });
  
  collectData();
};