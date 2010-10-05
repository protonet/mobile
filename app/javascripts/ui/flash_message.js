/**
 * Use this for notifying users about a failed or succeeded operation
 * Much more fancier than alert()!
 *
 * @example
 *    // either
 *    protonet.Notifications.trigger("flash_message.error", "Ouch something bad happened!");
 *    
 *    // or
 *    protonet.ui.FlashMessage.show("error", "Ouch something bad happened!");
 */
protonet.ui.FlashMessage = {
  classNames: ["notice", "error", "warning"],
  TIMEOUT: 5000,
  
  initialize: function() {
    this.element = $("div.flash-message").click(this.hide.bind(this));
    
    if ($.trim(this.element.text())) {
      this.show();
    }
    
    this._observe();
  },
  
  _observe: function() {
    protonet.Notifications
      .bind("flash_message.error flash_message.notice flash_message.warning", function(event, message) {
        this.show(event.handleObj.namespace, message);
      }.bind(this));
  },
  
  show: function(type, message) {
    if (message) {
      // Using html() instead of text() here would open security holes
      this.element.find("p").text(message);
    }
    
    if (type) {
      $.each(this.classNames, function(i, className) {
        this.element.removeClass(className);
      }.bind(this));
      this.element.addClass(type);
    }
    
    this.element.stop().css("position", "fixed").animate({ top: "0px" });
    
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.hide.bind(this), this.TIMEOUT);
  },
  
  hide: function() {
    this.element.stop().animate({ top: (-this.element.outerHeight()).px() }, function() {
      /**
       * Set it back to absolute to avoid scrolling performance issues
       * in webkit browsers
       */
      this.element.css("position", "absolute");
    }.bind(this));
  }
};