protonet.ui.Confirm = Class.create(protonet.ui.Dialog, {
  confirmDefaultOptions: {
    confirm:  $.noop,
    cancel:   $.noop,
    headline: protonet.t("headline_confirm"),
    text:     "",
    content:  ""
  },
  
  initialize: function($super, options) {
    this.dialogDefaultOptions = $.extend({}, this.dialogDefaultOptions, this.confirmDefaultOptions);
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
    $super();
    
    var $output   = this.$dialog.find("output"),
        $confirm  = $("<button>", { "class": "confirm",      text: protonet.t("label_ok")     }).appendTo($output),
        $cancel   = $("<button>", { "class": "hide-overlay", text: protonet.t("label_cancel") }).appendTo($output);
    
    if (this.options.content) {
      $output.prepend(this.options.content);
    }
    
    $confirm.focus();
  },
  
  _observe: function($super) {
    $super();
    
    this.$overlay.on("mousedown keydown", function(event) {
      event.stopPropagation();
    });
    
    this.$overlay.on("click", "button.confirm", function(event) {
      this.confirmed = true;
      this.hide();
      event.preventDefault();
    }.bind(this));
  }
});