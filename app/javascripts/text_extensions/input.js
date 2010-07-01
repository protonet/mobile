protonet.text_extensions.Input = function(input) {
  this.input = input;
  this.providers = protonet.text_extensions.provider;
  this.container = $("#text-extension-preview");
  this.hiddenInput = $("#text-extension-input");
  this.removeLink = this.container.find("a.remove");
  this._ignoreUrls = [];
  
  this.regExp = /(\b(((https?|ftp):\/\/)|(www\.))[-A-Z0-9+&@#\/%?=~_|!:,.;\[\]]*[-A-Z0-9+&@#\/%=~_|])/gi;
  
  this._initEvents();
};

protonet.text_extensions.Input.prototype = {
  _initEvents: function() {
    this.input.bind("paste", this._paste.bind(this));
    this.input.bind("keyup", this._keyUp.bind(this));
    this.removeLink.bind("click", this._cancel.bind(this));
    protonet.Notifications.bind("message.send", this._submitted.bind(this));
  },
  
  _paste: function() {
    // Some jerk at w3c decided to fire the onpaste before the text is inserted
    // therefore we need to delay the parsing
    setTimeout(this._parse.bind(this), 10);
  },
  
  _keyUp: function(event) {
    var isSpaceBar = event.keyCode == 32,
        isLineBreak = event.shiftKey && event.keyCode == 13,
        isEscape = event.keyCode == 27;
    
    if (isSpaceBar || isLineBreak) {
      return this._parse();
    }
    
    if (isEscape) {
      return this._cancel();
    }
  },
  
  _cancel: function(event) {
    event && event.preventDefault();
    
    this._cancelRequest = true;
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
    this._getDataProvider(this.url);
    
    if (this.provider) {
      this._show();
      this._request();
    }
  },
  
  _getDataProvider: function(url) {
    $.each(this.providers, function(key, value) {
      if (value.REG_EXP.test(url)) {
        this.provider = value;
        this.providerName = key;
        return false;
      }
    }.bind(this));
  },
  
  _request: function() {
    this._cancelRequest = false;
    this.provider.loadData(this.url, this._render.bind(this), this._ignoreUrlAndReset.bind(this));
  },
  
  _render: function(data) {
    if (this._cancelRequest) {
      return;
    }
    
    this.data = $.extend({}, data, { type: this.providerName, url: this.url });
    this.renderer = new protonet.text_extensions.render(this.container, this.data);
    
    this.setInput(this.data);
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
      this.container.css({ height: "auto", overflow: "visible" });
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
  
  _submitted: function() {
    this._cancelRequest = true;
    this._ignoreUrls = [];
    this.reset();
  },
 
  _ignoreUrlAndReset: function() {
    this._ignoreUrls.push(this.url);
    this.reset();
  },
  
  setInput: function(value) {
    this.hiddenInput.val(value && JSON.stringify(value));
  },
  
  reset: function() {
    this.container.stop();
    if (this.container.is(":visible")) {
      this._hide();
    }
    
    this.setInput("");
    
    delete this.data;
    delete this.url;
    delete this.provider;
  },
  
  getData: function() {
    return this.data;
  }
};