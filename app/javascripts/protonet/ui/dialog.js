protonet.ui.Dialog = Class.create(protonet.ui.Overlay, {
  dialogDefaultOptions: {
    headline: "",
    content:  "",
    text:     "",
    "class":  "dialog"
  },
  
  initialize: function($super, options) {
    this.defaultOptions = $.extend({}, this.defaultOptions, this.dialogDefaultOptions);
    $super(options);
  },
  
  show: function($super) {
    this.$dialog = new protonet.utils.Template("dialog-template", this.options).to$().appendTo(this.$overlay);
    
    if (this.options.content) {
      this.$dialog.find("output").html(this.options.content);
    }
    
    $super();
    
    setTimeout(this.resize.bind(this), 0);
  },
  
  resize: function() {
    var $relative = protonet.ui.ModalWindow.isVisible() ? $(".modal-window") : $window,
        top       = Math.max(0, $relative.outerHeight() / 2 - this.$dialog.outerHeight()  / 2),
        left      = Math.max(0, $relative.outerWidth()  / 2 - this.$dialog.outerWidth()   / 2);
    
    this.$dialog.css({
      top:  top.px(),
      left: left.px()
    });
  },
  
  _observe: function($super) {
    $window.on("resize.dialog", this.resize.bind(this));
    $super();
  },
  
  _unobserve: function($super) {
    $window.off(".dialog");
    $super();
  }
});