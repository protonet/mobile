(function() {
  protonet.timeline.RemoteChannel = Class.create(protonet.timeline.Channel, {
    initialize: function($super, data) {
      this.isOnline = true;
      $super(data);
    },
    
    _observe: function($super) {
      protonet
        .on("node.connected", function(data) {
          if (this.data.node_id == data.node_id) {
            this.link.removeClass("offline");
            this.isOnline = true;
            this.updateState();
          }
        }.bind(this))
        
        .on("node.disconnected", function(data) {
          if (this.data.node_id == data.node_id) {
            this.link.addClass("offline");
            this.isOnline = false;
            this.updateState();
          }
        }.bind(this))
        
        .on("channel.rendered channel.rendered_more", function(channelList, data, instance) {
          if (instance === this) {
            channelList.addClass("remote-channel");
          }
        }.bind(this));
      
      $super();
    },
    
    toggle: function($super, isSelected) {
      $super(isSelected);
      this.updateState();
      return this;
    },
    
    renderTab: function($super, tabContainer) {
      $super(tabContainer);
      this.link.addClass("global");
      return this;
    },
    
    updateState: function() {
      if (this.isSelected) {
        protonet.trigger("file_widget.hide");
        if (this.isOnline) {
          this.hint && this.hint.detach();
          protonet.trigger("form.enable");
        } else {
          this.hint = this.hint || $("<p>", { text: "The node of this channel is currently offline", "class": "info-message" });
          this.hint.prependTo(this.container);
          protonet.trigger("form.disable");
        }
      } else {
        this.hint && this.hint.detach();
      }
    }
  });
})();