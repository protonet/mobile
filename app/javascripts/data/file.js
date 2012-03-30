/**
 * File Model
 */
protonet.data.File = (function() {
  var seq           = 0,
      responders    = {},
      TIMEOUT       = (5).seconds(),
      VIEW_BASE_URL = protonet.config.base_url      + "/files",
      NODE_BASE_URL = protonet.config.node_base_url + "/fs";
  
  protonet.on("fs.list fs.info", function(data) {
    var responder = responders[data.client_seq];
    if (!responder) { return; }
    responder(data);
    delete responders[data.client_seq];
  });
  
  function prepareParameters(options) {
    if (typeof(options) === "function") {
      options = { success: options };
    }
    return $.extend({ success: $.noop, error: $.noop }, options);
  }
  
  function socketRequest(operation, params, options) {
    var data = {
      operation:  operation,
      params:     params,
      client_seq: seq++
    };
    
    responders[data.client_seq] = function(data) {
      delete responders[data.client_seq];
      if (data.status === "success") {
        options.success(data.result);
      } else {
        options.error(data.error);
      }
    };
    
    setTimeout(function() {
      var responder = responders[data.client_seq];
      if (!responder) { return; }
      responder({ status: "error", error: "TimeoutError" });
      delete responders[data.client_seq];
    }, TIMEOUT);
    
    protonet.trigger("socket.send", data);
    
    return {
      abort: function() { delete responders[data.client_seq]; }
    };
  }
  
  return {
    list: function(path, options) {
      if (!path.endsWith("/")) {
        path += "/";
      }
      options = prepareParameters(options);
      return socketRequest("fs.list", { parent: path }, options);
    },
    
    get: function(path, options) {
      options = prepareParameters(options);
      var originalSuccess = options.success;
      options.success = function(data) {
        data = data[0];
        originalSuccess(data);
      };
      return this.getAll([path], options);
    },
    
    getAll: function(paths, options) {
      options = prepareParameters(options);
      return socketRequest("fs.info", { paths: paths }, options);
    },
    
    getUrl: function(path) {
      if (!path || path === "/") {
        return VIEW_BASE_URL;
      }
      return VIEW_BASE_URL + "?path=" + encodeURIComponent(path);
    },
    
    getDownloadUrl: function(path, options) {
      options = prepareParameters(options);
      var url = NODE_BASE_URL + "/download/?paths=" + encodeURIComponent(path);
      if (options.embed) {
        url += "&embed=true";
      }
      return url;
    },
    
    getContent: function(path, options) {
      options = prepareParameters(options);
      $.ajax(this.getDownloadUrl(path), $.extend({
        data: {
          token:    protonet.config.token,
          user_id:  protonet.config.user_id
        }
      }, options));
    },
    
    scan: function(path, options) {
      options = prepareParameters(options);
      $.ajax(NODE_BASE_URL + "/scan?path=" + encodeURIComponent(path), options);
    }
  };
})();