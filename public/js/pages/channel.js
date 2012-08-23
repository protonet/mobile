(function(protonet){

  var channelListTimeout;

  protonet.pages.Channel = Class.create({
    initialize: function(data){
      this.id = data.id;
      this.name = data.name;
      this.href = "/#channel-" + this.id;
      this.$content = new protonet.utils.Template("channel", { 
        id: this.id, 
        name: this.name 
      }).to$();
      this.$timeline = this.$content.find('.timeline');
      protonet.trigger("page.created", this);
      this._observe();
    },
    _observe: function(){

      this.$content.bind('pageshow',function(){
        this._scrollToBottom();
      }.bind(this));

      protonet.on("meep.created." + this.id, function(meep){
        var $meep = new protonet.utils.Template("meep",{
          author: meep.author,
          message: meep.message,
          created_at: meep.created_at
        }).to$();

        this.$timeline.append($meep);
        protonet.trigger("meep.rendered", $meep, meep);

        channelListTimeout && clearTimeout(channelListTimeout),
        channelListTimeout = setTimeout(function(){
          protonet.dashboard.updateList();
        }, 1000);

        this._scrollToBottom();
      }.bind(this));

      this.$content.delegate(".meep_form", "submit", function(event){
        event.preventDefault();
        var $this = $(event.target).find("textarea");
        var message = $this.val();
        if (message.length) {
          protonet.trigger("socket.send", {
            operation:  "meep.create",
            payload:    {
              message: message,
              channel_id: this.id,
              user_id: protonet.config.user_id
            }
          });
          $this.val("");
        }
      }.bind(this));
    },
    _scrollToBottom: function(){
      $.mobile.silentScroll(this.$timeline.height());
    }
  });

})(protonet);