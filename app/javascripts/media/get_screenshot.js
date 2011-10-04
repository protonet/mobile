protonet.media.getScreenShot = function(url) {
  return protonet.config.node_base_url + "/screenshooter?url=" + encodeURIComponent(url);
};