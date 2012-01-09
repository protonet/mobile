$(function() {
  
  function send() {
    protonet.trigger("socket.send", {
      operation:  "work",
      task:       "http_proxy",
      url:        url
    });
  }
  
});
