protonet.controls.TextExtension.Input = function(input) {
  if (!input) {
    throw new Error("TextExtension: Missing input element");
  }
  
  this.input = input;
  this.sortedProviders = protonet.controls.TextExtension.config.SORTED_PROVIDERS;
  this.providers = protonet.controls.TextExtension.providers;
  this.container = $("#text-extension-preview");
  this.hiddenInput = $("#text-extension-input");
  this.removeLink = this.container.find("a.remove");
  this._ignoreUrls = [];
  
  this.regExp = /(\b(((https?|ftp):\/\/)|(www\.))[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  
  this._initEvents();
};

protonet.controls.TextExtension.Input.prototype = {
  _initEvents: function() {
    this.input.bind("paste", this._paste.bind(this));
    this.input.bind("keyup", this._keyUp.bind(this));
    this.removeLink.bind("click", this._cancel.bind(this));
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
  
  _cancel: function(event) {
    event.preventDefault();
    
    this._ignoreUrls.push(this.url);
    
    this.input.focus();
    this.reset();
  },
  
  _parse: function() {
    if (this.url) { return; }
    
    var matchUrls = this.input.val().match(this.regExp);
    if (!matchUrls) { return; }
    
    for (var i=0; i<matchUrls.length; i++) {
      var url = this._prepareUrl(matchUrls[i]),
          shouldBeIgnored = $.inArray(url, this._ignoreUrls) != -1;
      
      if (!shouldBeIgnored && url.isUrl()) {
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
    var instance, i, providerLength = this.sortedProviders.length;
    for (i=0; i<providerLength; i++) {
      this.providerName = this.sortedProviders[i];
      
      if (!this.providers.hasOwnProperty(this.providerName)) {
        continue;
      }
      
      instance = new this.providers[this.providerName](url, this);
      if (instance.match()) {
        return instance;
      }
    }
  },
  
  _request: function() {
    this.provider.loadData(this._render.bind(this), this._ignoreUrlAndReset.bind(this));
  },
  
  _render: function(data) {
    this.data = $.extend({}, data, { type: this.providerName });
    this.renderer = new protonet.controls.TextExtension.Renderer(
      this.container, this.data, this.provider
    );
    
    this.hiddenInput.val(JSON.stringify(this.data));
    this.container.removeClass("loading-bar");
    this.expand();
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
      height: this.renderer.resultsElement.outerHeight(true).px(),
      opacity: 100
    }, 200, function() {
      this.container.css({
        height: "auto",
        overflow: ""
      });
    }.bind(this));
  },
  
  _hide: function() {
    this.results && this.results.hide();
    this.container.stop().animate({
      height: 0,
      opacity: 0
    }, 200, function() {
      this.container.hide();
      
      if (this.renderer && this.renderer.resultsElement) {
        this.renderer.resultsElement.remove();
      }
    }.bind(this));
  },
  
  _prepareUrl: function(url) {
    if (url.startsWith("www.")) {
      url = "http://" + url;
    }
    return url;
  },
  
  submitted: function() {
    this.provider && this.provider.cancel();
    this._ignoreUrls = [];
    this.reset();
  },
 
  _ignoreUrlAndReset: function() {
    this._ignoreUrls.push(this.url);
    this.reset();
  },
  
  reset: function() {
    this.container.stop();
    if (this.container.is(":visible")) {
      this._hide();
    }
    
    this.hiddenInput.val("");
    
    delete this.data;
    delete this.url;
    delete this.provider;
  },
  
  getData: function() {
    return this.data;
  }
};