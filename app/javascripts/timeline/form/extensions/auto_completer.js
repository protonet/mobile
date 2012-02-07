//= require "../../../ui/inline_autocompleter.js"

/**
 * Auto completion for users and channels
 */
protonet.timeline.Form.extensions.AutoCompleter = function(input) {
  var autoCompleter = new protonet.ui.InlineAutocompleter(input, [], {
    maxChars: 2,
    prefix:   "@"
  });
  
  function collectData() {
    var users         = protonet.data.User.getCache(),
        channels      = protonet.data.Channel.getCache(),
        userNames     = [],
        channelNames  = [];
    
    $.each(users, function(i, user) {
      if (user.isStranger && !user.isOnline) {
        return;
      }
      
      if (user.isOnline) {
        userNames.unshift(user.name);
      } else {
        userNames.push(user.name);
      }
    });
    
    $.each(channels, function(i, channel) {
      channelNames.push(channel.name);
    });
    
    autoCompleter.setData(userNames.concat(channelNames));
  }
  
  protonet.on("channel.added user.added users.update_status", collectData);
  
  collectData();
};