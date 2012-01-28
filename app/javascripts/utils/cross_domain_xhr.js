protonet.utils.crossDomainXHR = function(url, options) {
  options = $.extend({}, {
    type:     "GET",
    success:  $.noop,
    error:    $.noop,
    complete: $.noop,
    timeout:  (20).seconds(),
    data:     null
  }, options);
  
  var xhr;
  if (window.XDomainRequest) {
    xhr = new window.XDomainRequest();
  } else {
    xhr = new XMLHttpRequest();
  }
  
  if (options.timeout) {
    if (window.XDomainRequest) {
      xhr.timeout = options.timeout;
    } else {
      var timeout = setTimeout(function() {
        xhr.onreadystatechange = $.noop;
        try { xhr.abort(); } catch(e) {}
        options.error(xhr);
        options.complete(xhr);
      }, options.timeout);
    }
  }
  
  if (window.XDomainRequest) {
    xhr.onload(function() {
      options.success(xhr.responseText, null, xhr);
      options.complete(xhr);
    });
    xhr.onerror = xhr.ontimeout = function() {
      options.error(xhr);
      options.complete(xhr);
    };
  } else {
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        clearTimeout(timeout);
        if (xhr.status >= 200 && xhr.status < 300) {
          options.success(xhr.responseText, null, xhr);
        } else {
          options.error(xhr);
        }
        options.complete(xhr);
      }
    };
  }
  
  xhr.open(options.type, url, true);
  
  if (xhr.setRequestHeader) {
    xhr.setRequestHeader('Content-Type', 'text/plain');
  }
  
  xhr.send(options.data);
};