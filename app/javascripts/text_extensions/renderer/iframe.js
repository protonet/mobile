protonet.text_extensions.render.iframe = function(data) {
  var iframe = $("<iframe>", { src: data.iframe });
  if (data.iframeRefreshInterval) {
    setInterval(function() {
      iframe.is(":visible") && iframe.attr("src", data.iframe);
    }, data.iframeRefreshInterval * 1000);
  }
  return iframe;
};