protonet.utils.NotificationMessage = function() {
  this._observe();
};

protonet.utils.NotificationMessage.prototype = {
  ELEMENT: $("div.message"),
  
  _observe: function() {
    if (this.ELEMENT.size() > 0) {
      setTimeout(function() {
        this._show();
      }.bind(this), 500);
      
      setTimeout(function() {
        this._hide();
      }.bind(this), 5500);
    }
  },
  
  _show: function() {
    this.ELEMENT.animate({
      top: "0px",
    }, 150);
  },
  
  _hide: function() {
    this.ELEMENT.animate({
      top: "-50px",
    }, 150);
  }
};