(function(protonet){

  var $scrollinput = $('<input type="text>">');

  protonet.pages.Channel = Class.create({
    initialize: function(data){
      this.channel   = data;
      this.id        = data.id;
      this.name      = data.name;
      this.uuid      = data.uuid;
      this.href      = "/#channel-" + this.id;
      this.typing    = false;

      this.$content  = new protonet.utils.Template("channel", { 
        id: this.id, 
        name: this.name 
      }).to$();
      
      this.$timeline = this.$content.find('.timeline');
      this.$form     = this.$content.find('.meep_form');
      this.$input    = this.$form.find('textarea');
      this.$loadMore = this.$content.find('.show_more a');

      this._observe();
      protonet.trigger("page.created", this);
      protonet.one("sync.succeeded", function(){
        if (this.channel.meeps.length < 10) {
          this.$loadMore.hide();
        };
      }.bind(this));
    },
    scrollToBottom: function(){
      if (protonet.currentPage == this) {
        setTimeout(function(){
          window.scrollTo(0, document.body.scrollHeight - protonet.utils.viewport().height );
        }, 0);
      };
    },
    _observe: function(){
    
      protonet.
      on("meep.created." + this.id, function(meep){
        var $meep = new protonet.utils.Template("meep",{
          author: meep.author,
          message: meep.message,
          created_at: meep.created_at,
          avatar: protonet.utils.ImageProxy.getImageUrl(meep.avatar,{
            height: 25,
            width: 25
          })
        }).to$();
        
        if (meep.user_id == protonet.config.user_id) {
          $meep.addClass("me");
        };

        if (meep == this.channel.lastMeep) {
          this.$timeline.append($meep);
          if (protonet.currentPage == this) {
            setTimeout(function () {
              this.scrollToBottom();
            }.bind(this), 0);
          };
        }else{
          this.$timeline.prepend($meep);
        }

        protonet.trigger("meep.rendered", $meep, meep);

      }.bind(this)).
      on("channel.meepsLoaded", function(channel, data){
        if (channel != this.channel) { return; };
        if (data.length < 10) {
          this.$loadMore.hide();
        };
      }.bind(this));

      this.$form.submit(function(event){
        event.preventDefault();
        var message = this.$input.val();

        this._typingEnd();

        if (message.length) {
          protonet.trigger("socket.send", {
            operation:  "meep.create",
            payload:    {
              message: message,
              channel_id: this.id,
              user_id: protonet.config.user_id
            }
          });
          this.$input.val("");
        }
      }.bind(this));

      this.$loadMore.bind("click", function(event){
        var scrollHeight = this.$content[0].scrollHeight;
        this.channel.loadMoreMeeps(function(data){
          window.scrollTo(0, this.$content[0].scrollHeight - scrollHeight);
        }.bind(this));
      }.bind(this));

      this.$content.delegate("h1.ui-title", "click", function(event){
        setTimeout(function(){
          window.scrollTo(0,1);
        }, 0);
      });
    },
    _typingStart: function() {
      if (!this.typing) {
        this.typing = true;
        protonet.trigger("socket.send", {
          operation: "user.typing",
          payload: { 
            user_id:      protonet.config.user_id,
            channel_id:   this.id,
            channel_uuid: this.uuid
          }
        });
      } 
      clearTimeout(this._typingTimeout);
      this._typingTimeout = setTimeout(this._typingEnd.bind(this), 2500);
    },
    _typingEnd: function() {
      if (this.typing) {
        this.typing = false;
        clearTimeout(this._typingTimeout);
        protonet.trigger("socket.send", {
          operation: "user.typing_end",
          payload: { user_id: protonet.config.user_id }
        });
      }
    }
  });

})(protonet);