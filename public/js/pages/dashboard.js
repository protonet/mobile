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
      var userList = this._generateUserList(protonet.users);
      this.$userList.
        empty().
        append(userList).
        listview('refresh');
    },
    updateChannelList: function(){

      var channelArray = [],
          rendezvousArray = [],
          $channelList;

      $.each(protonet.channels, function(i, channel){
        if (!channel.lastMeep) {
          channel.lastMeep = { id: -1 }
        };
        if (channel.rendezvousId) {
          rendezvousArray.push(channel);
        }else{
          channelArray.push(channel);
        }
      });

      $channelList = this._sortedChannelList(channelArray),
          
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
      protonet.on("meep.rendered channel.created channel.deleted", function(){
        if (timeout) {
          clearTimeout(timeout);
        };
        timeout = setTimeout(function(){
          this.updateChannelList();
        }.bind(this), 1000);
      }.bind(this));

      this.$userList.delegate("a.user-link", "click touchend", function(event){
        event.preventDefault();
        event.stopPropagation();
        var id = $(event.target).data("id");
        if (!protonet.rendezvous[id]) {
          $.ajax({
            url: "/rendezvous",
            type: "post",
            data: {
              user_id: id
            },
            success: function(data){
              if (data.channel_id) {
                console.log(data);
              }else{
                console.err(data);
              }
            }
          });
        }else{
          protonet.changePage("/#channel-" + protonet.rendezvous[id].id);
        }
      });
    },
    _generateUserList: function(users){
      var userArray = [],
          $list = $();
      $.each(users, function(i, user){
        userArray.push(user);
      });
      userArray = userArray.sort(function(a,b){
        if (a.nam < b.name) //sort string ascending
          return -1 
        if (a.name > b.name)
          return 1
         return 0
      });
      $.each(userArray, function(i, user){
        var $templ = new protonet.utils.Template("user-link", {
          id: user.id,
          name: user.name
        }).to$();
        $list = $list.add($templ);
      });
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
        $list = $list.add($templ);
      });
      return $list;
    }
  });

})(protonet);