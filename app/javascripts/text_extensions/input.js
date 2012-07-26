//= require "../utils/parse_uri_list.js"

/**
 * @events
 *    text_extension_input.render - trigger this with text extension data in order to attach a text extension
 */
protonet.text_extensions.Input = function(input) {
  this.input        = input;
  this.container    = $("#text-extension-preview");
  this.hiddenInput  = $("#text-extension-input");
  this.removeLink   = this.container.find("a.remove");
  this._ignoreUrls  = [];
  
  // TODO: umlauts?
  this.regExp = /(\b(((https?|ftp):\/\/)|(www\.))[-A-Z0-9+&@#\/%?=~_|!:,.;\[\]]*[-A-Z0-9+&@#\/%=~_|])/gi;
  
  this._initEvents();
};

protonet.text_extensions.Input.prototype = {
  _initEvents: function() {
    this.input
      .bind("paste",          this._paste.bind(this))
      .bind("keyup",          this._keyUp.bind(this))
      .bind("dragenter",      this._dragEnter.bind(this))
      .bind("drop",           this._drop.bind(this));
    
    this.removeLink
      .bind("click",          this._cancel.bind(this));
    
    protonet
      .on("form.submitted",               this._submitted.bind(this))
      .on("text_extension_input.render",  this.render.bind(this))
      .on("text_extension_input.select",  this.select.bind(this));
  },
  
  _paste: function() {
    // Some jerk at w3c decided to fire the onpaste before the text is inserted
    // therefore we need to delay the parsing
    setTimeout(this._parse.bind(this), 0);
  },
  
  _keyUp: function(event) {
    var isSpaceBar  = event.keyCode == 32,
        isLineBreak = event.keyCode == 13 && event.shiftKey,
        isEscape    = event.keyCode == 27;
    
    if (isSpaceBar || isLineBreak) {
      return this._parse();
    }
    
    if (isEscape) {
      return this._cancel();
    }
  },
  
  _dragEnter: function(event) {
    event.preventDefault();
    var valueLength = this.input.val().length;
    this.input.prop({
      selectionEnd:   valueLength,
      selectionStart: valueLength
    }).focus();
  },
  
  _drop: function(event) {
    var dataTransfer = event.dataTransfer;
    if (dataTransfer) {
      var urls = dataTransfer.getData("text/uri-list") || dataTransfer.getData("URL");
      if (urls) {
        urls = protonet.utils.parseUriList(urls);
        this.select(urls);
        event.preventDefault();
      }
    }
    
    setTimeout(this._parse.bind(this), 0);
  },
  
  _cancel: function(event) {
    event && event.preventDefault();
    
    this._cancelRequest = true;
    this._ignoreUrls = this._ignoreUrls.concat(this.urls);
    
    this.input.focus();
    this.reset();
  },
  
  _parse: function() {
    if (this.provider && !this.provider.supportsMultiple) { return; }
    
    var urls = this.input.val().match(this.regExp);
    
    this.select(urls);
  },
  
  select: function(urls) {
    urls = $.makeArray(urls);
    
    if (!urls.length) { return; }
    
    // turn into real urls
    urls = $.map(urls, function(url) {
      url = this._prepareUrl(url);
      return url.isUrl() ? url : null;
    }.bind(this));
    
    if (!urls.length) { return; }
    
    // strip urls that should be ignored
    urls = $.map(urls, function(url) {
      return this._ignoreUrls.indexOf(url) === -1 ? url : null;
    }.bind(this));
    
    if (!urls.length) { return; }
    
    var lastUrl = urls[urls.length - 1];
    this.provider = this._getDataProvider(lastUrl);
    
    if (!this.provider) { return; }
    
    if (this.provider.supportsMultiple) {
      urls = (this.urls || []).concat(urls);
      urls = $.map(urls, function(url) {
        return url.match(this.provider.REG_EXP) ? url : null;
      }.bind(this));
    }
    
    urls = urls.unique();
    
    if (!urls.length) { return; }
    
    if (this.urls && this.urls.toString() === urls.toString()) { return; }
    
    this.urls = urls;
    
    this._show();
    this._request();
  },
  
  _getDataProvider: function(url) {
    var provider, i;
    for (i in protonet.text_extensions.provider) {
      provider = protonet.text_extensions.provider[i];
      if (url.match(provider.REG_EXP)) {
        provider.name = i;
        return provider;
      }
    }
  },
  
  _request: function() {
    this._cancelRequest = false;
    this.provider.loadData(this.provider.supportsMultiple ? this.urls : this.urls[0], function(data) {
      if (!this._cancelRequest) {
        data = $.extend({}, data, { type: this.provider.name, url: data.url || this.urls[0] });
        this.render(data);
      }
    }.bind(this), this._ignoreUrlAndReset.bind(this));
  },
  
  render: function(data) {
    this._removeRenderer();
    this.data = data;
    this.element = protonet.text_extensions.render(data);
    this.container.append(this.element);
    this.setInput(data);
    this.container.removeClass("loading-bar").show();
    this.expand();
  },
  
  _removeRenderer: function() {
    if (this.element) {
      this.element.remove();
    }
  },
  
  _show: function() {
    if (this.container.is(":visible")) {
      return;
    }
    
    this.container
      .addClass("loading-bar")
      .animate({
        height: "30px",
        opacity: 100
      }, 200)
      .show();
  },
  
  expand: function() {
    this.container.stop().animate({
      height: this.element.outerHeight(true).px(),
      opacity: 100
    }, 200, function() {
      this.container.css({ height: "auto", overflow: "visible" });
    }.bind(this));
  },
  
  _hide: function() {
    if (this.results) {
      this.results.hide();
    }
    this.container.stop().animate({
      height: 0,
      opacity: 0
    }, 200, function() {
      this.container.hide();
      this._removeRenderer();
    }.bind(this));
  },
  
  _prepareUrl: function(url) {
    if (url.startsWith("www.")) {
      url = "http://" + url;
    }
    url = url.replace(/\/#!?\//, "/");
    return url;
  },
  
  _submitted: function() {
    this._cancelRequest = true;
    this._ignoreUrls = [];
    this.reset();
  },
 
  _ignoreUrlAndReset: function() {
    this._ignoreUrls = this._ignoreUrls.concat(this.urls);
    this.reset();
  },
  
  setInput: function(data) {
    this.hiddenInput.val(data ? JSON.stringify(data) : "");
  },
  
  reset: function() {
    this.container.stop();
    if (this.container.is(":visible")) {
      this._hide();
    }
    
    this.setInput("");
    
    delete this.data;
    delete this.urls;
    delete this.provider;
  },
  
  getData: function() {
    return this.data;
  }
};