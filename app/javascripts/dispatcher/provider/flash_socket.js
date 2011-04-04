protonet.dispatcher.provider.FlashSocket = {
  isSupported: function() {
    return location.search.indexOf("noflash=1") == -1 && window.swfobject && swfobject.hasFlashPlayerVersion("8");
  },
  
  initialize: function() {
    // We have to insert the flash outside the body in firefox, otherwise the flash gets reloaded as soon as you
    // change the css overflow property of the body element
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=90268
    var container   = $("<div>", { id: "socket-container" }).appendTo($.browser.mozilla ? "html" : "body"),
        attributes  = { id: "flash-socket" },
        params      = { allowscriptaccess: "sameDomain", wmode: "opaque" };
    
    // Fires "socket.initialized" when ready
    swfobject.embedSWF(
      "/flash/socket.swf?" + new Date().getTime(),
      "socket-container",
      "auto", "auto", "8",
      null, {}, params, attributes
    );
  },
  
  _authenticate: function() {
    this.send({
      operation: "authenticate",
      payload: {
        user_id:  protonet.config.user_id,
        token:    protonet.config.token,
        type:     "web"
      }
    });
  },
  
  connect: function() {
    this.socket = this.socket || swfobject.getObjectById("flash-socket");
    if (!this.socket) {
      // User is probably using a flash blocker
      return;
    }
    this.socket.connectSocket(protonet.config.dispatching_server, protonet.config.dispatching_server_port);
    // the flash socket will trigger the socket.connected event
    protonet.bind("socket.connected", this._authenticate.bind(this));
  },
  
  disconnect: function() {
    if (!this.socket) {
      return;
    }
    this.socket.closeSocket();
  },
  
  send: function(data) {
    if (!this.socket) {
      return;
    }
    this.socket.sendData(JSON.stringify(data));
  },
  
  receive: function(rawData) {
    /**
     * Policy XML message
     * FIXME: Handle this in the flash socket
     */
    if ($.trim(rawData).startsWith("<?xml")) {
      return;
    }
    
    return JSON.parse(rawData);
  }
};