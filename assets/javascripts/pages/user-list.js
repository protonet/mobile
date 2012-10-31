(function(protonet){

  var isVisible      = false,
      currentChannel = null,
      onlineUsers    = {},
      channelUsers   = {},
      $userElements  = {};

  protonet.pages.UserList = Class.create({
    initialize: function(data){
      this.$userList    = new protonet.utils.Template("userlist",{}).to$();
      this.$userList.page();
      this.$onlineList  = this.$userList.find("ul.online");
      this.$offlineList = this.$userList.find("ul.offline");
      var users = protonet.usersController.getAll();
      for (var i = 0; i < users.length; i++) {
        this.$buildUserElement(users[i]);
      };
      this._observe();
    },
    show:function(channelId){
      if (this.isVisible) {
        this.hide();
        return;
      };
      this.currentChannel = protonet.channelsController.get(channelId);
      this.refresh();
      this.$userList.appendTo($('body'));
      $('.ui-page-active').addClass("move-left");
      this.isVisible = true;
    },
    hide: function(){
      this.$userList.detach();
      $('.move-left').removeClass("move-left");
      this.isVisible = false;
    },
    refresh: function(){
      var online  = [],
          offline = [];
          channel = this.currentChannel;

      this.$onlineList.empty();
      this.$offlineList.empty();

      for (var i = 0; i < channel.users.length; i++) {
        var id = channel.users[i].id;
        if (onlineUsers[id]) {
          this.$onlineList.append($userElements[id]);
        }else{
          this.$offlineList.append($userElements[id]);
        }
      };
    },
    $buildUserElement: function(user){
      var $elem = $("<li>", {
        "data-user-id": user.id
      }).append(user.name);
      if (user.id == protonet.currentUser.id) {
        $elem.addClass("me");
      };
      $userElements[user.id] = $elem;
    },
    _observe: function(){
      protonet
        .on("user.came_online", function(data){
          var user = protonet.usersController.get(data.id);
          if (user) {
            onlineUsers[data.id] = user;
            this.isVisible && this.refresh();
          };          
        }.bind(this))
        .on("user.goes_offline", function(data){
          delete onlineUsers[data.id];
          this.isVisible && this.refresh();
        }.bind(this))
        .on("users.update_status", function(data){
          channelUsers = data.channel_users;
          onlineUsers  = data.online_users;
          for(id in onlineUsers){
            if (!protonet.usersController.get(id)) {
              var data = onlineUsers[id];
              data.subscribed_channel_ids = []; 
              for(uuid in channelUsers){
                if (channelUsers[uuid].indexOf(+id) !== -1 || channelUsers[uuid].indexOf(id) !== -1) {
                  data.subscribed_channel_ids.push(uuid);
                };
              }
              protonet.trigger("user.came_online", data);
            };
          }
          this.isVisible && this.refresh();
        }.bind(this))
        .on("user.new", function(user){
          this.$buildUserElement(user);
        }.bind(this));
    }
  });

})(protonet);