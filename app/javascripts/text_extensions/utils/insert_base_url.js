protonet.text_extensions.utils.insertBaseUrl = (function() {
  var localUrlPlaceholder = "http://protonet/",
      currentBaseUrl      = protonet.config.base_url + "/";
  return function(data) {
    var i;
    for (i in data) {
      if (typeof(data[i]) === "string" && data[i].startsWith(localUrlPlaceholder)) {
        data[i] = currentBaseUrl + data[i].substr(localUrlPlaceholder.length);
      }
    }
    return data;
  };
})();