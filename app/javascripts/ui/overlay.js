protonet.ui.Overlay = Class.create({
  defaultOptions: {
    show:     true,
    html:     "",
    "class":  ""
  },
  
  initialize: function(options) {
    this.options = $.extend({}, this.defaultOptions, options)
    this.$overlay = $("<div>", { "class": "overlay" });
    
    if (this.options["class"]) {
      this.$overlay.addClass(this.options["class"]);
    }
    
    if (this.options.html) {
      this.$overlay.html(this.options.html);
    }
    
    if (protonet.ui.ModalWindow.isVisible()) {
      protonet.ui.ModalWindow.append(this.$overlay);
    } else {
      this.$overlay.appendTo("body");
    }
    
    if (this.options.show) {
      this.show();
    }
  },
  
  _observe: function() {
    if (this.$overlay.find(".hide-overlay").length) {
      this.$overlay.on("click", ".hide-overlay", this.hide.bind(this));
      
      this.$overlay.on("click", function(event) {
        if (this.$overlay.is(event.target)) {
          this.hide();
        }
      }.bind(this));
      
      $("html").on("keydown.overlay", function(event) {
        if (event.keyCode === 27) {
          this.hide();
          event.preventDefault();
        }
      }.bind(this));
    }
  },
  
  _unobserve: function() {
    $("html").off(".overlay");
  },
  
  hide: function() {
    this.$overlay.fadeOut("fast", function() {
      this.$overlay.remove();
    }.bind(this));
    
    this._unobserve();
  },
  
  show: function() {
    this.$overlay.fadeIn();
    this._observe();
  }
});