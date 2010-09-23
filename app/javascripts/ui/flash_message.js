protonet.ui.FlashMessage = {
  classNames: ["notice", "error", "warning"],
  TIMEOUT: 5000,
  
  initialize: function() {
    this.element = $("div.flash-message").click(this.hide.bind(this));;
    
    if ($.trim(this.element.text())) {
      this.show();
    }
  },
  
  show: function(type, message) {
    if (message) {
      // Using html() instead of text() here will open security holes
      this.element.find("p").text(message);
    }
    
    if (type) {
      $.each(this.classNames, function(i, className) {
        this.element.removeClass(className);
      }.bind(this));
      this.element.addClass(type);
    }
    
    this.element.stop().animate({ top: "0px" });
    
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.hide.bind(this), this.TIMEOUT);
  },
  
  hide: function() {
    this.element.stop().animate({ top: (-this.element.outerHeight()).px() });
  }
};