protonet.utils.highlightReplies = (function() {
  var REG_EXP = /(\s|^)@([\w\.\-_@]+)/g;
  
  function highlightInStream(str) {
    return str.replace(REG_EXP, function(match, $1, $2) {
      recognition = recognizeItem($2);
      switch(recognition['type']) {
        case 'channel':
          return $1 + "@" + '<a class="reply channel"' + ' href="#channel_name=' + $2 + '">' + $2 + '</a>';
          break;
        case 'current-user':
          return $1 + "@" + '<span class="reply to-me">' + $2 + '</span>';
          break;
        default:
          return $1 + "@" + '<span class="reply ' + $2 + '">' + $2 + '</span>';
      }
    });
  }
  
  function recognizeItem(str) {
    var originalChannelName = protonet.globals.channelSelector.channelsDowncaseMapping[str.toLowerCase()];
    var channelId = protonet.globals.availableChannels[originalChannelName];
    if (channelId) {
      return {'type':'channel', 'id':channelId};
    } else if (str.toLowerCase().match(protonet.config.user_name.toLowerCase())) {
      return {'type':'current-user'};
    } else {
      return {'type':'user'};
    }
  }
  
  function recognizeAllChannels(str) {
    var channelIds = [];
    var matches = str.match(REG_EXP);
    if(matches) {
      $.each(matches, function(i){
        var recognized = recognizeItem($.trim(matches[i]).substring(1));
        if(recognized['type'] == 'channel') {
          channelIds.push(recognized['id']);
        }
      });
    }
    return channelIds;
  }
  
  return {
    highlightInStream: highlightInStream,
    recognizeItem: recognizeItem,
    recognizeAllChannels: recognizeAllChannels
  };
})();