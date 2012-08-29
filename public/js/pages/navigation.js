(function(protonet){

  protonet.pages.Navigation = Class.create({
    initialize: function(){
      this.href = "/#navigation";
      this.$content = new protonet.utils.Template("channel_navigation").to$();
      this.$channelList = this.$content.find("#channel_list");
      this._observeChannels();
      $.mobile.loading('show');
      protonet.one("navigation.updated", function(event){
        $.mobile.loading('hide');
      });
    },
    updateList: function(){
      this.$channelList.empty();

      // sort channelList
      var channels = [];
      $.each(protonet.channels, function(i, channel){
        if (!channel.lastMeep) {
          channel.lastMeep = {
            id: -1,
            author: "",
            message: "",
            created_at: ""
          }
        };
        channels.push(channel);
      });
      channels = channels.sort(function(a,b){
        return b.lastMeep.id-a.lastMeep.id;
      })

      $.each(channels, function(i, channel){
        this.$channelList.append(new protonet.utils.Template("channel-link",{
          id:         channel.id,
          name:       channel.name,
          author:     channel.lastMeep.author,
          message:    channel.lastMeep.message.truncate(50),
          created_at: channel.lastMeep.created_at
        }).to$());
      }.bind(this));

      protonet.trigger("navigation.updated", this);
    },
    _observeChannels: function(){

      protonet
        /**
         * append a channel to channel_navigation
         */
        .on("channel.created", function(channel){
          
        }.bind(this))
        /**
         * delete Channel if user unsubscribed channel
         */
        .on("channel.deleted", function(channel){
          
        }.bind(this));
    }
  });

})(protonet);