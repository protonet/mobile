protonet.ui.Confirm = Class.create(protonet.ui.Overlay, {
  _defaultOptions: {
    confirm:  $.noop,
    cancel:   $.noop,
    headline: protonet.t("ARE_YOU_SURE"),
    "class":  "confirm",
    text:     "",
    content:  ""
  },
  
  initialize: function($super, options) {
    this.defaultOptions = $.extend({}, this.defaultOptions, this._defaultOptions);
    
    $super(options);
  },
  
  hide: function($super) {
    $super();
    
    if (this.confirmed) {
      this.options.confirm();
    } else {
      this.options.cancel();
    }
  },
  
  show: function($super) {
    new protonet.utils.Template("confirm-template", this.options).to$().appendTo(this.$overlay);
    
    var $output = this.$overlay.find("output");
    
    if (this.options.content) {
      $output.html(this.options.content);
    } else {
      $output.remove();
    }
    
    $super();
    
    this.$overlay.find("button.confirm").focus();
  },
  
  _observe: function($super) {
    $super();
    
    this.$overlay.on("mousedown keydown", function() {
      event.stopPropagation();
    });
    
    this.$overlay.on("click", "button.confirm", function(event) {
      this.confirmed = true;
      this.hide();
      event.preventDefault();
    }.bind(this));
  }
});