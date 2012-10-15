(function(protonet){

  var $scrollinput = $('<input type="text>">');

  function $buildMeep(meep){
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
    return $meep;
  }

  protonet.pages.Channel = Class.create({
    initialize: function(data){
      this.channel   = data;
      this.id        = data.id;
      this.name      = data.name;
      this.uuid      = data.uuid;
      this.href      = "#channel-" + this.id;
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
    
      protonet
        .on("meep.created." + this.id, function(meep){
          var $meep = $buildMeep(meep);
          if (meep === this.channel.lastMeep) {
            // append
            var previousMeep = this.channel.getMeep(-2, -1);
            if (previousMeep 
                  && previousMeep.user_id === meep.user_id
                  && (meep.created_at - previousMeep.created_at < (5).minutes()) 
                  && !meep.text_extension 
                  && !previousMeep.text_extension) {

              var $meepToMerge  = this.$timeline.find("li.meep:last"),
                  $timeToUpdate = $meepToMerge.find("time"),
                  prettyDate    = protonet.utils.prettifyDate(meep.created_at);
              $meep.find("article").insertAfter($meepToMerge.find("article:last"));
              $timeToUpdate.attr("title", meep.created_at).text(prettyDate);

            }else{
              this.$timeline.append($meep);
            }
            if (protonet.currentPage == this) {
              setTimeout(function () {
                this.scrollToBottom();
              }.bind(this), 0);
            };
          }else{
            // prepend
            var nextMeep = this.channel.getMeep(1, 2);
            if (nextMeep 
                  && nextMeep.user_id === meep.user_id
                  && (nextMeep.created_at - meep.created_at < (5).minutes()) 
                  && !meep.text_extension
                  && !nextMeep.text_extension) {
              // merge Meeps
              var $meepToMerge = this.$timeline.find("li.meep:first");
              $meep.find("article").insertBefore($meepToMerge.find("article:first"));
            }else{
              this.$timeline.prepend($meep);
            }
          }

          protonet.trigger("meep.rendered", $meep, meep);

        }.bind(this))

        .on("channel.meepsLoaded", function(channel, data){
          if (channel != this.channel) { return; };
          if (data.length < 10) {
            this.$loadMore.hide();
          };
        }.bind(this))

        .on("user.typing", function(data){
          if (data.channel_uuid == this.uuid || data.user_id == protonet.currentUser.id) {
            return
          };
          
        }.bind(this))

        .on("user.typing_end", function(data){
          
        }.bind(this));

      this.$input.keypress(function(event) {
        if (!event.metaKey) { this._typingStart(); }
      }.bind(this));

      this.$form.submit(function(event){
        event.preventDefault();
        var message = this.$input.val();

        this._typingEnd();

        if (message.length) {
          this.$input.val("");
          this.$input.focus();
          protonet.trigger("socket.send", {
            operation:  "meep.create",
            payload:    {
              message: message,
              channel_id: this.id,
              user_id: protonet.config.user_id
            }
          });
        }
      }.bind(this));

      this.$loadMore.bind("click", function(event){
        var scrollHeight = this.$content[0].scrollHeight;
        this.channel.loadMoreMeeps(function(data){
          window.scrollTo(0, this.$content[0].scrollHeight - scrollHeight);
        }.bind(this));
      }.bind(this));

      this.$content.delegate("h1.ui-title", "click", function(event){
        window.scrollTo(0,1);
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