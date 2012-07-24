/**
 * Auto completion for users and channels
 */
protonet.timeline.Form.extensions.AutoCompleter = function(input) {
  var autoCompleter = new protonet.ui.InlineAutocompleter(input, [], {
    maxChars: 2,
    prefix:   "@"
  });
  
  // FIXME: ONLY SUGGEST USERS THAT ARE IN THE SAME CHANNEL AS I AM
  
  function collectData(channelId) {
    var users               = protonet.data.User.getCache(),
        channels            = protonet.data.Channel.getCache(),
        viewer              = protonet.config.user_id,
        viewerSubscriptions = protonet.data.User.getSubscriptions(viewer),
        userNames           = [],
        channelNames        = [];
    
    $.each(users, function(i, user) {
      // Don't add strangers that are offline
      if (user.isStranger && !user.isOnline) {
        return;
      }
      
      // Don't add remote users to autocompleter when currently focused channel is a local channel
      if (channelId && user.isRemote && !protonet.data.Channel.isGlobal(channelId)) {
        return;
      }
      
      // Only add user to autocompleter when the user is in a channel that the viewer also is in
      // this is particulary necessary for invitees and strangers that are not allowed to see users from
      // other channels
      var hasSameChannel,
          j = 0;
      for (; j<viewerSubscriptions.length; j++) {
        if (user.subscriptions.indexOf(viewerSubscriptions[j]) !== -1) {
          hasSameChannel = true;
          break;
        }
      }
      
      if (!hasSameChannel) {
        return;
      }
      
      if (user.isOnline) {
        userNames.unshift(user.name);
      } else {
        userNames.push(user.name);
      }
    });
    
    $.each(channels, function(i, channel) {
      if (!channel.rendezvous && viewerSubscriptions.indexOf(channel.id) !== -1) {
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