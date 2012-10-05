/**
 * Use this for notifying users about a failed or succeeded operation
 * Much more fancier than alert()!
 *
 * @example
 *    // either
 *    protonet.trigger("flash_message.error", "Ouch something bad happened!");
 *    
 *    // or
 *    protonet.ui.FlashMessage.show("error", "Ouch something bad happened!");
 */
protonet.ui.FlashMessage = {
  classNames: ["notice", "error", "sticky"],
  TIMEOUT: 5000,
  
  initialize: function() {
    this.element = $("div.flash-message");
    this.element.click(this.hide.bind(this));
    this.messageContainer = this.element.find("p");
    this.element.find(".flash-message-close-link").click(this.hide.bind(this));
    
    if ($.trim(this.messageContainer.text())) {
      this.show();
    }
    
    this._observe();
  },
  
  _observe: function() {
    $.each(["error", "notice", "sticky"], function(i, type) {
      protonet.on("flash_message." + type, function(message) { 
        this.show(type, message); 
      }.bind(this));
    }.bind(this));
  },
  
  show: function(type, message) {
    if (message) {
      // Using html() instead of text() here would open security holes
      this.messageContainer.text(message);
    }
    
    if (type) {
      $.each(this.classNames, function(i, className) {
        this.element.removeClass(className);
      }.bind(this));
      this.element.addClass(type);
    }
    
    this.element.stop(true, true).hide().fadeIn();
    
    clearTimeout(this.timeout);
    
    // also non stickies auto hide after TIMEOUT seconds
    if (!this.element.hasClass("sticky")) {
      // auto hide after 5 sec (but only if the user has already seen it)
      if (protonet.utils.isWindowFocused() || type !== "error") {
        this.timeout = setTimeout(this.hide.bind(this), this.TIMEOUT);
      } else {
        $window.one("focus", function() {
          this.timeout = setTimeout(this.hide.bind(this), this.TIMEOUT);
        }.bind(this));
      }
    }
  },
  
  hide: function(event) {
    if (event && $(event.currentTarget).hasClass("sticky")) {
      return;
    }
    
    this.element.stop().fadeOut();
    
    event && event.preventDefault && event.preventDefault();
  }
};