protonet.ui.FlashMessage = {
  initialize: function() {
    this.element = $("div.flash-message");
    
    if (this.element.length) {
      this.element.click(this._hide.bind(this));
      setTimeout(this._show.bind(this), 500);
      setTimeout(this._hide.bind(this), 5500);
    }
  },
  
  _observe: function() {
    this.element.click(this._hide.bind(this));
  },
  
  _show: function() {
    this.element.animate({ top: "0px" });
  },
  
  _hide: function() {
    this.element.animate({ top: (-this.element.outerHeight()).px() });
  }
};