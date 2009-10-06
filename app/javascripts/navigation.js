var protonet = protonet || {};
protonet.controls = protonet.controls || {};

protonet.controls.Navigation = {
  TEMPLATE_URL: "/navigation",
  _visible: false,
  
  initialize: function() {
    this._loadHtml();
  },
  
  _loadHtml: function() {
    $.ajax({
      url: this.TEMPLATE_URL,
      type: "GET",
      success: function(response){
        $("body").append(response);
        this._initElements();
        this._initEvents();
      }.bind(this)
    });
  },
  
  _initElements: function() {
    this._container = $("#navigation");
    this._position();
  },
  
  _initEvents: function() {
    $(document).bind("keydown", "alt+space", function(event) {
      this.toggle();
      event.preventDefault();
      event.stopPropagation();
    }.bind(this));
    $(document).bind("keydown", "esc", function(event) {
      this.hide();
    }.bind(this));
    // send user to link defined by <a href=
    this._container.find('li').click(function(event) {
      document.location = $(this).find('a')[0].href;
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
    this._position();
    this._container.show();
    this._observePosition();
    this._visible = true;
  },
  
  hide: function() {
    this._container.fadeOut(200);
    this._visible = false;
  },
  
  _position: function(slide) {
    var window_ = $(window),
        styles = {
          left: window_.scrollLeft() + (window_.width() / 2 - this._container.outerWidth() / 2),
          top: window_.scrollTop() + (window_.height() / 2 - this._container.outerHeight() / 2)
        };
    
    if (slide) {
      this._container.stop();
      this._container.animate(styles);
    } else {
      this._container.css(styles);
    }
  },
  
  _observePosition: function() {
    $(window).bind("scroll resize", function() {
      this._position(true);
    }.bind(this));
  }
};

$(function() {
  protonet.controls.Navigation.initialize();
});