//= require "../../utils/sandbox.js"
//= require "../../utils/is_same_origin.js"

/**
 * Recommended to read
 * http://stackoverflow.com/questions/169258/is-http-streaming-comet-possible-in-safari
 * http://www.shanison.com/2010/05/10/stop-the-browser-%E2%80%9Cthrobber-of-doom%E2%80%9D-while-loading-comet-forever-iframe/
 */
protonet.dispatcher.provider.HttpStreaming = (function() {
  var SCRIPT_REG_EXP = /<script>[\s\S]*?<\/script>/mg;
  
  return {
    isSupported: function() {
      return true;
    },

    initialize: function() {
      protonet.trigger("socket.initialized");
    },

    connect: function() {
      // We need to start the xhr streaming from a hidden iframe
      // since Chrome/Safari show a loading indicator for active xhr requests
      // that were started before the onload event
      var sandbox = new protonet.utils.Sandbox();
      sandbox.load(function(win) {
        win.setTimeout(this._connect.bind(this, win), 100);
      }.bind(this)).appendTo("body");
    },
    
    _connect: function(win) {
      win = win || window;
      var byteOffset          = 0,
          authenticationData  = {
            user_id:  protonet.config.user_id,
            token:    protonet.config.token,
            type:     "web"
          },
          queryParams         = encodeURIComponent(JSON.stringify(authenticationData)),
          url                 = protonet.config.xhr_streaming_url + "?" + queryParams,
          connected,
          undef,
          abortOldRequest     = (function(oldRequest) {
            return function() {
              if (oldRequest) {
                oldRequest.abort();
                oldRequest = undef;
              }
            };
          })(this.ajax);
      
      clearTimeout(this.reconnectTimeout);
      
      // Use IE-proprietary XDomainRequest for same-origin requests
      // XMLHttpRequest doesn't work with http streaming since IE refuses to fill the responseText
      // property unless readyState == 4
      if (win.XDomainRequest) {
        this.ajax = new win.XDomainRequest();
        this.ajax.onprogress = function() {
          abortOldRequest();
          if (connected === undef) {
            connected = true;
            protonet.trigger("socket.connected", connected);
          }
          
          if (this.ajax.responseText.length === byteOffset) {
            return;
          }
          
          var responseText = this.ajax.responseText || "",
              rawData      = responseText.substring(byteOffset);
          byteOffset = responseText.length;
          protonet.trigger("socket.receive", rawData);
        }.bind(this);
        this.ajax.onload = this._connect.bind(this, win);
      } else {
        this.ajax = new win.XMLHttpRequest();
        this.ajax.onreadystatechange = function() {
          abortOldRequest();
          
          if (this.ajax.readyState >= 3 && connected === undef) {
            connected = (this.ajax.status === 200);
            protonet.trigger("socket.connected", connected);
          }

          if (!connected) {
            return;
          }

          if (this._hasReceivedData(this.ajax)) {
            var responseText = this.ajax.responseText || "",
                rawData      = responseText.substr(byteOffset),
                boundary     = rawData.lastIndexOf("<\/script>");
            if (boundary !== -1) {
              rawData = rawData.substr(0, boundary + 9);
              byteOffset = byteOffset + rawData.length;
              protonet.trigger("socket.receive", rawData);
            }
          }

          if (this._shouldReconnect(this.ajax)) {
            this._connect(win);
          }
        }.bind(this);
      }
      
      this.ajax.activeSince = new Date();
      this.ajax.open("GET", url, true);
      this.ajax.send(null);
      
      // iOS can only keep a request open for 60 seconds
      // So we open a new socket connection after 55 seconds to make sure the user function doesn't go offline
      // during reconnect
      this.reconnectTimeout = setTimeout(this._connect.bind(this, win), 55000);
    },
    
    _shouldReconnect: function(currentRequest) {
      var now = new Date();
      return  currentRequest.readyState  === 4 &&
              (
                currentRequest.status    === 200 ||
                // 0 === request got aborted (iOS seems to have a request timeout after 60 sec)
                currentRequest.status    === 0
              ) &&
              // only reconnect when the previous request was active for more than 10 sec
              (now - currentRequest.activeSince) > 10000;
    },
    
    _hasReceivedData: function(currentRequest) {
      return currentRequest.readyState >= 3;
    },
    
    disconnect: function() {
      this.ajax && this.ajax.abort();
    },

    send: function(data) {
      // Simulate ping, just check whether the ajax streaming request is still going
      var ajaxStillRunning = this.ajax.readyState !== 4;
      if (data.operation === "ping" && ajaxStillRunning) {
        setTimeout(function() {
          protonet.trigger("socket.ping_received");
        }, 0);
      }
    },

    receive: function(rawData) {
      var scripts = rawData.match(SCRIPT_REG_EXP) || [];
      
      return $.map(scripts, function(script) {
        // remove <script> and </script> from string
        script = script.substring(8);
        script = script.substring(0, script.length - 9);
        script = $.trim(script);
        
        try {
          var json = JSON.parse(script);
          if (json) {
            return json;
          }
        } catch(e) {}
        
        // null will not be captured in the resulting array created by $.map
        return null;
      });
    }
  };
})();