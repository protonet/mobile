//= require "../../utils/sandbox.js"

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
          connected;
          
      // Make sure that an already running request is aborted
      this.disconnect();
      
      this.ajax = new win.XMLHttpRequest();
      this.ajax.activeSince = new Date();
      this.ajax.open("GET", url, true);
      this.ajax.onreadystatechange = function() {
        if (this.ajax.readyState >= 3 && connected === undefined) {
          connected = (this.ajax.status == 200);
          protonet.trigger("socket.connected", connected);
        }
        
        if (!connected) {
          return;
        }
        
        if (this._hasReceivedData(this.ajax)) {
          var responseText = this.ajax.responseText || "";
              rawData      = responseText.substring(byteOffset);
          byteOffset = responseText.length;
          protonet.trigger("socket.receive", rawData);
        }
        
        if (this._shouldReconnect(this.ajax)) {
          this._connect(win);
        }
      }.bind(this);
      this.ajax.send(null);
    },
    
    _shouldReconnect: function(ajaxObj) {
      var now = new Date();
      return  ajaxObj.readyState  === 4 &&
              ajaxObj.status      === 200 &&
              // only reconnect when the old ajaxObj was active for more than 10 sec
              (now - ajaxObj.activeSince) > 10000;
    },
    
    _hasReceivedData: function(ajaxObj) {
      return ajaxObj.readyState === 3 || ajaxObj.readyState === 4;
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