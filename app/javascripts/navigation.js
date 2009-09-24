var protonet = protonet || {};
protonet.controls = protonet.controls || {};

protonet.controls.Navigation = {
  TEMPLATE_URL: "/navigation",
  _visible: false,
  
  initialize: function() {
    this._loadHtml();
  },
  
  _loadHtml: function() {
    var that = this;
    $.ajax({
      url: this.TEMPLATE_URL,
      type: "GET",
      success: function(response){
        $("body").append(response);
        that._initElements();
        that._initEvents();
      }
    });
  },
  
  _initElements: function() {
    this._container = $("#navigation");
  },
  
  _initEvents: function() {
    var that = this;
    $(document).bind("keydown", "alt+space", function(event) {
      that.toggle();
      event.preventDefault();
      event.stopPropagation();
    });
  },
  
  toggle: function() {
    if (this._visible) {
      this.hide();
    } else {  
      this.show();
    }
  },
  
  show: function() {
    this._container.fadeIn("fast");
    this._visible = true;
  },
  
  hide: function() {
    this._container.fadeOut("fast");
    this._visible = false;
  }
};

$(function() {
  protonet.controls.Navigation.initialize();
});