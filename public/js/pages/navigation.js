(function(protonet){

  protonet.pages.Navigation = Class.create({
    initialize: function(){
      this.$content = $('#navigation');
      this.$channelList = $("#channel_list");
      this.$channelList.listview();
      protonet.trigger("navigation.initialized", this);
      protonet.one("sync.succeeded", function(){
        this._observe();
        this.updateList();
      }.bind(this));
    },
    updateList: function(){
      // sort channel
      var channels = [];
      this.$channelList.empty();

      $.each(protonet.channels, function(i, channel){
        if (!channel.lastMeep) {
          channel.lastMeep = {
            id: -1
          }
        };
        channels.push(channel);
      });

      channels = channels.sort(function(a,b){
        return b.lastMeep.id-a.lastMeep.id;
      });
      
      $.each(channels, function(i, channel){
        this.$channelList.append(new protonet.utils.Template("channel-link",{
          id:         channel.id,
          name:       channel.name
        }).to$());
      }.bind(this));

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
          this.updateList();
        }.bind(this), 1000);
      }.bind(this));
    }
  });

})(protonet);