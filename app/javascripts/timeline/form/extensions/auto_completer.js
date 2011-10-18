//= require "../../../ui/inline_autocompleter.js"

/**
 * Auto completion for users and channels
 */
protonet.timeline.Form.extensions.AutoCompleter = function(input) {
  var userNames = [], channelNames = [];
  
  var autoCompleter = new protonet.ui.InlineAutocompleter(input, [], {
    maxChars: 2,
    prefix:   "@"
  });
  
  protonet
    /**
     * Add users to Autocompleter when loaded
     */
    .bind("users.data_available", function(e, users) {
      userNames = $.map(users, function(user) { return user.name; });
      autoCompleter.setData(userNames.concat(channelNames));
    })
  
    /**
     * Add channel names to autocompleter when initialized
     */
    .bind("channels.data_available", function(e, channelData, channelNameToIdMapping) {
      channelNames = Object.keys(channelNameToIdMapping);
      autoCompleter.setData(userNames.concat(channelNames));
    })
    
    /**
     * Sort users in autocompleter by online status
     */
    .bind("users.update_status", function(e, data) {
      $.each(data.online_users, function(id, user) {
        var index = userNames.indexOf(user.name);
        if (index !== -1) {
          userNames.splice(index, 1);
        }
        userNames.unshift(user.name);
      });
      autoCompleter.setData(userNames.concat(channelNames));
    })
    
    /**
     * Add newly registered user to auto completer
     */
    .bind("user.added", function(e, user) {
      autoCompleter.addData(user.name, true);
    })
    
    .bind("channel.added", function(e, channel) {
      autoCompleter.addData(channel.name, true);
    });
};