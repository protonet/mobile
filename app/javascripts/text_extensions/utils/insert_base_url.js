protonet.text_extensions.utils.insertBaseUrl = (function() {
  var localUrlPlaceholder = "http://protonet/",
      currentBaseUrl      = protonet.config.base_url + "/";
  return function(data) {
    var i;
    for (i in data) {
      if ($.type(data[i]) === "string") {
        if (data[i].startsWith(localUrlPlaceholder)) {
          data[i] = currentBaseUrl + data[i].substr(localUrlPlaceholder.length);
        }
      } else if ($.type(data[i]) === "array") {
        data[i] = $.map(data[i], function(value) {
          if (value.startsWith(localUrlPlaceholder)) {
            return currentBaseUrl + value.substr(localUrlPlaceholder.length);
          } else {
            return value;
          }
        });
      }
    }
    return data;
  };
})();