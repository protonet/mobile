(function(protonet){

  protonet.pages.Dashboard = Class.create({
    initialize: function(){
      this.$channelList = $('#channel-list');
      this.$channelList.listview();
      this.$userList = $('#user-list');
      this.$userList.listview();
      this.updateChannelList();
      this.updateUserList();
      this._observe();
      protonet.trigger("navigation.initialized", this);
    },
    updateUserList: function(){
      var users = protonet.usersController.getAll();

      // remove currentUser from UserList
      users.splice($.inArray(protonet.currentUser, users),1);
      this.$userList.
        empty().
        append(this._generateUserList(users)).
        listview('refresh');
    },
    updateChannelList: function(){

      var channelArray    = protonet.channelsController.getRealChannels(),
          rendezvousArray = protonet.channelsController.getRendezvous(),
          $channelList;

      $channelList = this._sortedChannelList(channelArray);

      this.$channelList.
        empty().
        append($channelList);

      if (rendezvousArray.length != 0) {
        var $rendezvousList = this._sortedChannelList(rendezvousArray);
        this.$channelList.
          append($('<li data-role="list-divider">private Chats</li>')).
          append($rendezvousList);
      };

      this.$channelList.listview('refresh');
    },
    _observe: function(){
      var timeout;
      /**
       * Sort List if a new Meep is rendered
       * append a channel to channel_navigation
       * delete Channel if user unsubscribed channel
       */
      protonet
        .on("meep.rendered channel.cacheExpired", function(){
          timeout && clearTimeout(timeout);
          timeout = setTimeout(function(){
            this.updateChannelList();
          }.bind(this), 1000);
        }.bind(this))

        .on("channel.updateLastReadMeeps", function(channel){
          $('a[link=#channel-' + channel.id +'] span')
            .empty()
            .hide();
        }.bind(this))

        .one("sync.succeeded", function(){
          this.updateChannelList();
        }.bind(this));

      this.$userList
        .delegate("a.user-link", "click", function(event){
          event.preventDefault();
        })
        .delegate("a.user-link", "click", function(event){
          event.preventDefault();
          event.stopPropagation();
          var id = $(event.target).data("id");
          protonet.channelsController.findOrCreateRendezvous(id, function(channel){
            protonet.changePage("#channel-" + channel.id);
          });
        });
    },
    _generateUserList: function(users){
      var $list = $();
      users = users.sort(function(a,b){
        if (a.nam < b.name) //sort string ascending
          return -1 
        if (a.name > b.name)
          return 1
         return 0
      });
      for (var i = 0; i < users.length; i++) {
        var $templ = new protonet.utils.Template("user-link", {
          id: users[i].id,
          name: users[i].name
        }).to$();
        $list = $list.add($templ);
      };
      return $list;
    },
    _sortedChannelList: function(channels){
      var $list = $();
      channels = channels.sort(function(a,b){
        return b.lastMeep.id - a.lastMeep.id;
      });
      $.each(channels, function(i, channel){
        var $templ = new protonet.utils.Template("channel-link", {
          id:   channel.id,
          name: channel.name 
        }).to$();

        if (channel.hasUnreadMeeps()) {
          $templ.find("span")
            .append(channel.countUnreadMeeps())
            .show();
        };

        $list = $list.add($templ);
      });
      return $list;
    }
  });

})(protonet);