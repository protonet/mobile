protonet.text_extensions.utils.replaceBaseUrl = (function() {
  var localUrlPlaceholder = "http://protonet/",
      currentBaseUrl      = protonet.config.base_url + "/";
  return function(data) {
    var i;
    for (i in data) {
      if (typeof(data[i]) === "string" && data[i].startsWith(currentBaseUrl)) {
        data[i] = localUrlPlaceholder + data[i].substr(currentBaseUrl.length);
      }
    }
    return data;
  };
})();