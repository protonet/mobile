protonet.text_extensions.utils.replaceBaseUrl = (function() {
  var localUrlPlaceholder = "http://protonet/",
      currentBaseUrl      = protonet.config.base_url + "/";
  return function(data) {
    var i;
    for (i in data) {
      if ($.type(data[i]) === "string") {
        if (data[i].startsWith(currentBaseUrl)) {
          data[i] = localUrlPlaceholder + data[i].substr(currentBaseUrl.length);
        }
      } else if ($.type(data[i]) === "array") {
        data[i] = $.map(data[i], function(value) {
          if (value.startsWith(currentBaseUrl)) {
            return localUrlPlaceholder + value.substr(currentBaseUrl.length);
          } else {
            return value;
          }
        });
      }
    }
    return data;
  };
})();