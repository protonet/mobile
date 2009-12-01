//= require "../data/yql.js"
//= require "../data/youtube.js"
//= require "../media/get_screenshot.js"
//= require "../utils/format_seconds.js"

protonet.controls.TextExtension = function(args) {
  if (!args || !args.input) {
    throw new Error("TextExtension: Missing input element");
  }
  if (navigator.onLine === false) {
    return;
  }
  
  this.input = args.input;
  this.container = $("#text-extension");
  this.resultsTemplate = $("#text-extension-template");
  this.hiddenInput = $("#text-extension-input");
  this.removeLink = this.container.find("a.remove");
  
  this.regExp = /(\S+\.{1}[^\s\,\.\!]+)/g;
  
  this._initEvents();
};

protonet.controls.TextExtension.prototype = {
  _initEvents: function() {
    this.input.bind("paste", this._paste.bind(this));
    this.input.bind("keyup", this._keyUp.bind(this));
    this.removeLink.bind("click", this._remove.bind(this));
  },
  
  _paste: function() {
    // Some jerk at w3c decided to fire the onpaste before the text is inserted
    // therefore we need to delay the parsing
    setTimeout(this._parse.bind(this), 10);
  },
  
  _keyUp: function(event) {
    var isSpaceBar = event.keyCode == 32,
        isLineBreak = event.shiftKey && event.keyCode == 13;
    
    if (isSpaceBar || isLineBreak) {
      this._parse();
    }
  },
  
  _remove: function(event) {
    event.preventDefault();
    
    this.input.focus();
    this.reset();
  },
  
  _parse: function() {
    if (this.url) { return; }
    
    var matchUrls = this.input.val().match(this.regExp);
    if (!matchUrls) { return; }
    
    
    for (var i=0; i<matchUrls.length; i++) {
      var url = this._prepareUrl(matchUrls[i]),
          hasMinLength = url.length > 10,
          hasUrlPrefix = url.startsWith("http") || url.startsWith("www."),
          isLastUrl = (url == this._lastUrl);
      
      if (hasMinLength && hasUrlPrefix && !isLastUrl) {
        this._selectUrl(url);
        break;
      }
    }
  },
  
  _selectUrl: function(url) {
    this.url = url;
    this.provider = this._getDataProvider(this.url);
    if (this.provider && this.url) {
      this._show();
      this._request();
    }
  },
  
  _getDataProvider: function(url) {
    var instance, providers = ["YouTube", "WebLink"]; // Order is important
    for (var i=0; i<providers.length; i++) {
      instance = new protonet.controls.TextExtension[providers[i]](url, this);
      if (instance.match()) {
        break;
      };
    }
    return instance;
  },
  
  _request: function() {
    this.provider.loadData(this._render.bind(this), this.reset.bind(this), this.reset.bind(this));
  },
  
  _render: function() {
    this.data = {
      description: this.provider.getDescription(),
      title: this.provider.getTitle(),
      type: this.provider.getType(),
      link: this.provider.getLink()
    };
    
    this.results = $(this.resultsTemplate.html());
    this.results.find(".description").html(this.data.description);
    this.results.find(".title").html(this.data.title);
    this.results.find(".type").html(this.data.type);
    this.results.find("a.link").attr("href", this.data.link);
    this.results.addClass(this.provider.getClassName());
    this.results.find(".media")
      .html(this.provider.getMedia())
      .bind("click", this.provider.getMediaLink());
    
    this.hiddenInput.val(JSON.stringify(this.data));
    
    this.container.append(this.results);
    this.container.removeClass("loading-bar");
    this.expand();
  },
  
  reset: function() {
    this._hide();
    this._lastUrl = this.url;
    
    delete this.data;
    delete this.url;
    delete this.provider;
  },
  
  _show: function() {
    this.container.addClass("loading-bar");
    this.container.animate({
      height: "30px",
      opacity: 100
    }, 200);
  },
  
  expand: function() {
    this.container.stop().animate({
      height: this.results.outerHeight(true).px(),
      opacity: 100
    }, 100);
  },
  
  _hide: function() {
    this.results && this.results.hide();
    this.container.stop().animate({
      height: 0,
      opacity: 0
    }, 200, function() {
      this.container.hide();
      this.results && this.results.remove();
    }.bind(this));
  },
  
  _prepareUrl: function(url) {
    if (url.startsWith("www.")) {
      url = "http://" + url;
    }
    return url;
  }
};

//= require "text_extension/web_link.js"
//= require "text_extension/youtube.js"