//= require "../lib/jquery.fullscreen.js"

protonet.ui.ImagePlayer = Class.create({
  initialize: function(urls) {
    this.urls = $.makeArray(urls);
    this.index = 0;
    this.show();
  },
  
  show: function() {
    this.$overlay = $("<div>", { "class": "overlay fullscreen" }).appendTo("body").fadeIn("fast");
    
    this.dimensions = {
      height: Math.round(this.$overlay.outerHeight() / 100 * 80),
      width:  Math.round(this.$overlay.outerWidth() / 100 * 80)
    };
    
    if ($.support.fullscreen) {
      this.$overlay.fullScreen({
        background: "#000000",
        callback:   function(isFullScreen) {
          if (!isFullScreen) { this.hide(); }
        }.bind(this)
      });
    } else {
      $("html").on("keydown.image_player", function(event) {
        if (event.keyCode === 27) { // ESC
          this.hide();
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }.bind(this));
      
      this.$overlay.on("click", function(event) {
        if (this.$overlay.is(event.target)) {
          this.hide();
        }
      }.bind(this));
    }
    
    if (this.urls.length > 1) {
      $("html").on("keydown.image_player", function(event) {
        if (event.keyCode === 37) {
          this.previous();
        }
        if (event.keyCode === 39) {
          this.next();
        }
      }.bind(this));
      
      $("<a>", { "class": "previous" }).appendTo(this.$overlay).on("click", this.previous.bind(this));
      $("<a>", { "class": "next" }).appendTo(this.$overlay).on("click", this.next.bind(this));
    }
    
    this.render(this.urls[this.index]);
  },
  
  hide: function() {
    $("html").off(".image_player");
    this.$overlay.remove();
  },
  
  render: function(url) {
    url = protonet.media.Proxy.getImageUrl(url, { width: this.dimensions.width, height: this.dimensions.height, extent: false });
    
    var $img = $("<img>", { src: url, "class": "item" }).one("load error", function() {
      $img.css({
        marginTop:  (-(($img.prop("naturalHeight") || $img.prop("height")) / 2)).px(),
        marginLeft: (-(($img.prop("naturalWidth") || $img.prop("width")) / 2)).px(),
        opacity:    0
      });
      
      var $oldImage = this.$overlay.find("img.item");
      if ($oldImage.length) {
        $img.insertAfter($oldImage);
        $oldImage.animate({ opacity: 0 }, function() { $oldImage.remove(); });
      } else {
        $img.appendTo(this.$overlay);
      }
      
      $img.animate({ opacity: 1 });
    }.bind(this));
  },
  
  next: function() {
    this.index++;
    if (this.index === this.urls.length) {
      this.index = 0;
    }
    this.render(this.urls[this.index]);
  },
  
  previous: function() {
    this.index--;
    if (this.index < 0) {
      this.index = this.urls.length - 1;
    }
    this.render(this.urls[this.index]);
  }
});