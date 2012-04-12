protonet.data.TwitPic = {};
protonet.data.TwitPic.getPhotoUrl = (function() {
  var DEFAULT_SIZE = "thumb",
      URL = "http://twitpic.com/show/{size}/{id}";
  
  return function(id, size) {
    size = size || DEFAULT_SIZE;
    return URL.replace("{id}", id).replace("{size}", size);
  };
})();