/**
 * File Model
 */
protonet.File = (function() {
  var seq                     = 0,
      responders              = {},
      TIMEOUT                 = (5).seconds(),
      REG_EXP_FILE_NAME       = /.*\/(.+?)(\/?)$/,
      REG_EXP_FILE_EXTENSION  = /\.(\w+)$/,
      REG_EXP_FOLDER          = /(.*\/)(.+\/?$)/,
      USER_FOLDER             = /^\/users\/(\d+)\/$/,
      CHANNEL_FOLDER          = /^\/channels\/(\d+)\/$/,
      REG_EXP_IMAGE           = /\.(jpe?g|gif|png|bmp|tiff?|eps|ps|ai|psd)$/i,
      VIEWER                  = protonet.config.user_id,
      VIEW_BASE_URL           = protonet.config.base_url + "/files",
      NODE_BASE_URL           = protonet.config.node_base_url + "/fs";
  
  protonet.on("fs.list fs.info fs.remove fs.move fs.mkdir fs.lastModified", function(data) {
    var responder = responders[data.client_seq];
    if (!responder) { return; }
    responder(data);
    delete responders[data.client_seq];
  });
  
  function prepareParameters(options) {
    if (typeof(options) === "function") {
      options = { success: options };
    }
    return $.extend({ success: $.noop, error: $.noop, complete: $.noop }, options);
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
      options.complete(data);
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
  
  function interpolateUserAndChannelNames(path, files, callback) {
    var model, ids;
    if (path === "/users/" || path === "/") {
      model = protonet.data.User;
    } else if (path === "/channels/") {
      model = protonet.data.Channel;
    } else {
      callback(files);
      return;
    }
    
    // foders stored in /users/ and /channels/ are named like the id of the corresponding channel/user
    ids = $.map(files, function(file) {
      if (file.type === "folder" && !isNaN(+file.name)) {
        return file.name;
      }
      return null;
    });
    
    model.getAll(ids, function() {
      $.each(files, function(i, file) {
        if (file.type !== "folder" || isNaN(+file.name)) { return; }
        
        var recordId = +file.name,
            record   = model.getCache()[recordId] || {};
        
        file.belongsTo = recordId;
        if (path === "/" && recordId === VIEWER) {
          file.name = protonet.t("files.name_user_folder");
        } else {
          file.name = record.name || file.name;
        }
        
        if (record.rendezvousPartner) {
          file.rendezvousFolder = true;
          file.rendezvousPartner = record.rendezvousPartner;
        }
      });
      callback(files);
    });
  }
  
  return {
    list: function(path, options) {
      options = prepareParameters(options);
      var originalSuccess = options.success;
      options.success = function(files) {
        interpolateUserAndChannelNames(path, files, originalSuccess);
      };
      return socketRequest("fs.list", { parent: path }, options);
    },
    
    remove: function(path, options) {
      options = prepareParameters(options);
      return socketRequest("fs.remove", { paths: $.makeArray(path) }, options);
    },
    
    move: function(oldPath, newPath, options) {
      options = prepareParameters(options);
      oldPath = $.makeArray(oldPath);
      return socketRequest("fs.move", { from: oldPath, to: newPath }, options);
    },
    
    rename: function() {
      return this.move.apply(this, arguments);
    },
    
    newFolder: function(path, options) {
      options = prepareParameters(options);
      var name    = this.getName(path),
          parent  = this.getFolder(path);
      return socketRequest("fs.mkdir", { parent: parent, name: name }, options);
    },
    
    getBaseUrl: function() {
      return VIEW_BASE_URL;
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
    
    getName: function(path) {
      if (path === "/") {
        return protonet.t("files.name_root_path");
      }
      
      if (path === protonet.data.User.getFolder(VIEWER)) {
        return protonet.t("files.name_user_folder");
      }
      
      var userMatch     = path.match(USER_FOLDER),
          channelMatch  = path.match(CHANNEL_FOLDER),
          id;
      
      if (userMatch) {
        return protonet.data.User.getName(userMatch[1]) || userMatch[1];
      } else if (channelMatch) {
        id = channelMatch[1];
        channel = protonet.data.Channel.getCache()[id];
        if (!channel) { return id; }
        
        if (channel.rendezvous) {
          return protonet.t("files.name_rendezvous_folder", {
            user_name: (protonet.data.User.getName(channel.rendezvousPartner) || "unknown")
          });
        } else {
          return channel.name;
        }
      } else {
        return path.match(REG_EXP_FILE_NAME)[1];
      }
    },
    
    getExtension: function(path) {
      return (path.match(REG_EXP_FILE_EXTENSION) || [, ""])[1].toLowerCase();
    },
    
    getFolder: function(path) {
      return path.match(REG_EXP_FOLDER)[1];
    },
    
    isFolder: function(path) {
      return path.endsWith("/");
    },
    
    isFile: function(path) {
      return !path.endsWith("/");
    },
    
    isChannelFolder: function(path) {
      var folderName = Number(path.match(REG_EXP_FILE_NAME)[1]);
      return this.getFolder(path) === "/channels/" && !!folderName;
    },
    
    isUserFolder: function(path) {
      var folderName = Number(path.match(REG_EXP_FILE_NAME)[1]);
      return this.getFolder(path) === "/users/" && !!folderName;
    },
    
    isImage: function(path) {
      return !!path.match(REG_EXP_IMAGE);
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
        dataType: "text",
        data: {
          token:    protonet.config.token,
          user_id:  VIEWER
        }
      }, options));
    },
    
    getLastModified: function(path, options) {
      options = prepareParameters(options);
      return socketRequest("fs.lastModified", { parent: path }, options);
    },
    
    scan: function(path, options) {
      options = prepareParameters(options);
      $.ajax(NODE_BASE_URL + "/scan?path=" + encodeURIComponent(path), options);
    }
  };
})();