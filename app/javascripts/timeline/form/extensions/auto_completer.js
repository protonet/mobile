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
    .on("users.data_available", function(users) {
      userNames = [];
      $.each(users, function(id, user) {
        if (user.isOnline) {
          userNames.unshift(user.name);
        } else {
          userNames.push(user.name);
        }
      });
      autoCompleter.setData(userNames.concat(channelNames));
    })
  
    /**
     * Add channel names to autocompleter when initialized
     */
    .on("channels.data_available", function(channelData, channelNameToIdMapping) {
      channelNames = Object.keys(channelNameToIdMapping);
      autoCompleter.setData(userNames.concat(channelNames));
    })
    
    /**
     * Add newly registered user to auto completer
     */
    .on("user.added", function(user) {
      autoCompleter.addData(user.name, true);
    })
    
    .on("channel.added", function(channel) {
      autoCompleter.addData(channel.name, true);
    });
};