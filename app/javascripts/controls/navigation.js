//= require "../lib/jquery.hotkeys-0.7.9.min.js"
//= require "../user/browser.js"

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
        this._initShortcut();
        this._initEvents();
      }.bind(this)
    });
  },
  
  _initElements: function() {
    this._container = $("#navigation");
    this._link = $("#navigation-link");
    this._position();
  },
  
  _initEvents: function() {
    $(document).bind("keydown", this._shortcut, function(event) {
      this.toggle();
      event.preventDefault();
      event.stopPropagation();
    }.bind(this));
    
    $(document).bind("keydown", "esc", this.hide.bind(this));
    
    this._link.bind("click", function(event) {
      event.preventDefault();
      this.toggle();
    }.bind(this));
    
    // send user to link defined by <a href=
    this._container.find("li").click(function(event) {
      if ($(this).hasClass("disabled")) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
      document.location = $(this).find("a").attr("href");
    });
  },
  
  _initShortcut: function() {
    this._shortcut = protonet.user.Browser.IS_ON_WINDOWS() ? "ctrl+space" : "alt+space";
    this._link.find(".shortcut").html("[" + this._shortcut.toUpperCase() + "]");
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