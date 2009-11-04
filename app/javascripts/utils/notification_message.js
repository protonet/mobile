protonet.utils.NotificationMessage = function() {
  this.element = $("div.message");
  
  this._observe();
};

protonet.utils.NotificationMessage.prototype = {
  _observe: function() {
    if (this.element.size() > 0) {
      this._height = parseInt(this.element.css("height"), 10) + 5;
      
      this.element.css("top", -this._height + "px");
      
      this.element.click(this._hide.bind(this));
      setTimeout(this._show.bind(this), 500);
      setTimeout(this._hide.bind(this), 5500);
    }
  },
  
  _show: function() {
    this.element.animate({
      top: "0px",
    }, 150);
  },
  
  _hide: function() {
    this.element.animate({
      top: -this._height + "px",
    }, 150);
  }
};