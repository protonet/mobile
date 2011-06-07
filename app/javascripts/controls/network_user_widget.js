//= require "../ui/resizer.js"
//= require "../ui/notification.js"

protonet.controls.NetworkUserWidget = function() {
  this.container = $("#network-user-widget");
  this.list = this.container.find("ul");
  this.resizer = this.container.find(".resize");
  
  this.onlineUsersCount = this.container.find("output.count");
  this.usersData = {};
  
  // protonet.Notifications.trigger("users.data_available", this.usersData);
  
  new protonet.ui.Resizer(this.list, this.resizer, { storageKey: "network_user_widget_height" });
  
  this._observe();
};

protonet.controls.NetworkUserWidget.prototype = {
  _observe: function() {
    protonet.Notifications
      .bind("system.update_connected_devices", function(e, data) {
        this.updateNetworkUsers(data["devices"]);
    }.bind(this));
  },
  
  updateNetworkUsers: function(clients) {
    this.deleteAllUsers()
    $(clients).each(function(i, client){
      this.createElement(client["mac"], client["hostname"], client["ip"]);
    }.bind(this));
  },
  
  createElement: function(mac, hostname, ip) {
    return $("<li />", {
      "data-network-mac": mac,
      "data-network-hostname": hostname,
      "data-network-ip": ip,
      title:          hostname
    }).append(
      $("<a />", {
        tabIndex: -1,
        href:     "#",
        text:     ( hostname == "?" ? ip : hostname )
      })
    ).appendTo(this.list);
  },
  
  deleteAllUsers: function() {
    this.list.children("li").remove()
  }
};
