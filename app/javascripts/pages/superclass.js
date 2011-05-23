//= require "../ui/modal_window.js"
//= require "../utils/escape_for_reg_exp.js"
//= require "../utils/escape_html.js"

protonet.Page = Class.create(protonet.ui.ModalWindow, {
  _defaultConfig: {
    url:            "/{name}/{state}",
    title:          "protonet - {name}",
    state:          "",
    request:        true,   // TODO
    behavior:       true,
    history:        true,
    reloadOnSubmit: true,   // TODO
    js:             null,   // TODO
    css:            null,   // TODO
    onInit:         $.noop,
    onShow:         $.noop,
    onState:        $.noop,
    onHide:         $.noop,
    onLoad:         $.noop, // TODO
    onSubmit:       $.noop  // TODO
  },
  
  initialize: function($super, pageName, config) {
    this.name         = pageName;
    this.config       = $.extend({}, this._defaultConfig, config);
    this.state        = this.config.state;
    this.history      = protonet.utils.History;
    this.behaviors    = protonet.utils.Behaviors;
    this.initialState = this.history.getCurrentPath();
    
    this._initDependencies();
    this._trigger("init");
    
    $super(pageName + "-page");
  },
  
  show: function($super, state) {
    $("html").data("page", this);
    this._trigger("show");
    state = state || this.getState();
    
    if (typeof(state) !== "undefined") {
      this.setState(state);
    }
    $super();
    return this;
  },
  
  hide: function($super, fromHistory) {
    if (!this.visible) {
      return;
    }
    
    this.state = null;
    $("html").data("page", null);
    if (!fromHistory) {
      this.history.register("");
    }
    this._trigger("hide");
    
    $super();
    return this;
  },
  
  setState: function(state) {
    if (state == this.state) {
      return;
    }
    this.state = state;
    this.history.register(this._interpolate(this.config.url, true));
    this._trigger("state");
  },
  
  getState: function() {
    return this.state;
  },
  
  toString: function() {
    return this.name;
  },
  
  _trigger: function(eventName) {
    protonet.trigger("page." + eventName, this.name);
    this.config["on" + eventName.capitalize()](this, this.name);
  },
  
  _initDependencies: function() {
    var url, selector, regExp;
    
    url = protonet.utils.escapeForRegExp(this.config.url)
      .replace(/\\\{name\\\}/, encodeURIComponent(this.name))
      .replace(/\\\{state\\\}/, "(.*?)(?:&|/|#|$)");
    regExp = new RegExp(url);
    
    if (this.initialState.match(regExp)) {
      this.initialState = "";
    }
    
    if (this.history && this.config.history) {
      this.history.onChange(function(path) {
        var match = path.match(regExp);
        if (match) {
          var state = decodeURIComponent(match[1]);
          this.show(state);
        } else {
          this.hide(true);
        }
      }.bind(this));
    }
    
    if (this.behaviors) {
      selector = typeof(this.config.selector) === "string" ? this.config.selector : "a[href]:click";
      this.behaviors.add(selector, function(element, event) {
        element = element[0];
        if (element.host !== location.host) {
          return;
        }
        
        var match = element.href.match(regExp);
        if (!match) {
          return;
        }
        
        this.show(decodeURIComponent(match[1]));
        event.preventDefault();
      }.bind(this));
    }
  },
  
  _interpolate: (function() {
    var NAME_REG_EXP  = /\{name\}/g,
        STATE_REG_EXP = /\{state\}/g;
    return function(str, isUrl) {
      var name  = isUrl ? encodeURIComponent(this.name) : this.name,
          state = isUrl ? encodeURIComponent(this.state || "") : (this.state || "");
      
      return str
        .replace(NAME_REG_EXP, name)
        .replace(STATE_REG_EXP, state);
    };
  })()
});