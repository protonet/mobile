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

      this.scroller = new iScroll(this.$content.find('.scroller')[0]);

      protonet.trigger("page.created", this);
      this._observe();
    },
    scrollToBottom: function(){
      if (this.scroller.wrapperH < this.scroller.scrollerH) {
        this.scroller.scrollTo(0,this.scroller.maxScrollY,0);
      };
    },
    _observe: function(){
      
      protonet.on("meep.created." + this.id, function(meep){
        var $meep = new protonet.utils.Template("meep",{
          author: meep.author,
          message: meep.message,
          created_at: meep.created_at
        }).to$();

        this.$timeline.append($meep);

        if (protonet.currentPage == this) {
          setTimeout(function () {
            this.scroller.refresh();
            this.scrollToBottom();
          }.bind(this), 0);
        };
        
        protonet.trigger("meep.rendered", $meep, meep);

        channelListTimeout && clearTimeout(channelListTimeout),
        channelListTimeout = setTimeout(function(){
          protonet.dashboard.updateList();
        }, 1000);

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
    }
  });

})(protonet);