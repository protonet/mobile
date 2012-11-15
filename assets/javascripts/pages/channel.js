(function(protonet, undefined){

  var $meepBulk = $("<ul>"),
      scrollHeight,
      prependTimeout;

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

      // needed for channels created after ready state
      for (var i = 0; i < this.channel.meeps.length; i++) {
        this.renderMeep(this.channel.meeps[i], true);
      };
    },
    scrollToBottom: function(){
      if (protonet.currentPage == this) {
        $.mobile.silentScroll(document.body.scrollHeight);
      };
    },

    renderMeep: function(meep, forceAppend){
      var $meep = $buildMeep(meep);
      if (meep === this.channel.lastMeep || forceAppend) {
        // append
        var previousMeep = this.channel.getPreviousMeep(meep);
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

        // TODO: prevent scrollToBottom when i am reading smth on top of page
        if (protonet.currentPage == this) {
          this.channel.markAllAsRead();
          setTimeout(function () {
            this.scrollToBottom();
          }.bind(this), 0);
        };

        setTimeout(function(){
          this.$timeline.height(this.$timeline.parent().scrollHeight - 120);
        }.bind(this),1);
      }else{
        // prepend
        var nextMeep = this.channel.getNextMeep(meep);
        if (nextMeep 
              && nextMeep.user_id === meep.user_id
              && (nextMeep.created_at - meep.created_at < (5).minutes()) 
              && !meep.text_extension
              && !nextMeep.text_extension
              && prependTimeout) {
          // merge Meeps
          var $meepToMerge = $meepBulk.find("li.meep:first");
          $meep.find("article").insertBefore($meepToMerge.find("article:first"));
        }else{
          $meepBulk.prepend($meep);
        }

        clearTimeout(prependTimeout);
        prependTimeout = setTimeout(function(){
          this.$timeline
            .prepend($meepBulk.children())
            .height(this.$timeline.parent().scrollHeight - 120);
          setTimeout(function(){
            window.scrollTo(0, this.$content[0].scrollHeight - scrollHeight);
          }.bind(this), 20);

          $meepBulk.empty();
          prependTimeout = undefined;
        }.bind(this), 101);
      }
      
      protonet.trigger("meep.rendered", $meep, meep);
    },
    _observe: function(){
    
      protonet
        .on("meep.created." + this.id , this.renderMeep.bind(this)) 

        .on("channel.meepsLoaded", function(channel, data){
          if (channel != this.channel) { return; };
          if (data.length < 10) {
            this.$loadMore.hide();
          };
        }.bind(this))

        .on("channel.change", function(id){
          if (id != this.id) { return ;}
          !this.channel.isActive() && this.channel.setActive();
          this.channel.markAllAsRead();
        }.bind(this))

        .on("user.typing", function(data){
          if (data.channel_uuid == this.uuid || data.user_id == protonet.currentUser.id) {
            return
          };
          
        }.bind(this))

        .on("user.typing_end", function(data){
          if (data.channel_uuid == this.uuid || data.user_id == protonet.currentUser.id) {
            return
          };
          
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
        // save scrollHeight here to scroll back 
        // to same position after rendering meeps
        scrollHeight = this.$content[0].scrollHeight;
        this.channel.loadMoreMeeps();
      }.bind(this));

      this.$content
        .delegate("h1.ui-title", "vclick", function(event){
          window.scrollTo(0,1);
        })
        .delegate(".ui-header a", "click", function(event){
          $(this).removeClass("ui-btn-down-b");
          event.preventDefault();
        })
        .delegate(".ui-header a[link='#navigation']", "vclick", function(event){
          event.preventDefault();
          protonet.userList.isVisible && protonet.userList.hide();
          $.mobile.changePage($('#navigation'),{
            dataUrl: "#navigation"
          });
        })
        .delegate(".ui-header a[link='#user-list']", "vclick", function(event){
          protonet.userList.show(this.id);
        }.bind(this))
        .on("pagehide", function(event){
          this.$content.detach();
          if (protonet.currentPage == this) {
            protonet.currentPage = null;
          };
        }.bind(this));

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