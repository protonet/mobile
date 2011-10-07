$(function() {
  var input = $("a[rel]");
  protonet.utils.toggleElement(input);
});

$(function() {
  $("#channels-page li.channel").click(function(event){
    event.preventDefault();
    var element = $(event.currentTarget);
    var channelId = element.attr("id").match(/channel-(.*)/)[1];
    var nodeId = element.parent().parent().attr('id').match(/network-(.*)/)[1];
    $("#channels-details").load("/channels/" + channelId + '?node_id=' + nodeId);
    $("#channels-page li.channel.clicked").toggleClass("clicked");
    $(this).toggleClass("clicked");
    location.hash = channelId;
  });
  if(location.hash) {
    $("#channel-" + location.hash.substring(1)).click();
  } else {
    $("#channels-page li.channel:first").click();
  }
});