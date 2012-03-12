//= require "../utils/unshort_url.js"
//= require "utils/replace_base_url.js"

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
    setTimeout(this._parse.bind(this), 10);
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
  
  _drop: function() {
    this._parse();
  },
  
  _cancel: function(event) {
    event && event.preventDefault();
    
    this._cancelRequest = true;
    this._ignoreUrls.push(this.url);
    
    this.input.focus();
    this.reset();
  },
  
  _parse: function() {
    if (this.url || this.data) { return; }
    
    var matchUrls = this.input.val().match(this.regExp);
    if (!matchUrls) { return; }
    
    for (var i=0; i<matchUrls.length; i++) {
      var url = this._prepareUrl(matchUrls[i]),
          shouldBeIgnored = $.inArray(url, this._ignoreUrls) != -1;
      
      if (!shouldBeIgnored && url.isUrl()) {
        this.select(url);
        break;
      }
    }
  },
  
  select: function(url) {
    this.url = url;
    this._show();
    
    protonet.utils.unshortUrl(url, function(originalUrl) {
      this.originalUrl = originalUrl.replace(/\/#!?\//, "/");
      this._getDataProvider(originalUrl);
      this.provider ? this._request() : this._hide();
    }.bind(this));
  },
  
  _getDataProvider: function(url) {
    $.each(protonet.text_extensions.provider, function(key, value) {
      if (value.REG_EXP.test(url)) {
        this.provider = value;
        this.providerName = key;
        return false; // equivalent to "break;"
      }
    }.bind(this));
  },
  
  _request: function() {
    this._cancelRequest = false;
    this.provider.loadData(this.originalUrl, function(data) {
      if (!this._cancelRequest) {
        data = $.extend({}, data, { type: this.providerName, url: data.url || this.originalUrl });
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
    this.results && this.results.hide();
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
  
  setInput: function(data) {
    data = protonet.text_extensions.utils.replaceBaseUrl(data);
    this.hiddenInput.val(data && JSON.stringify(data));
  },
  
  reset: function() {
    this.container.stop();
    if (this.container.is(":visible")) {
      this._hide();
    }
    
    this.setInput("");
    
    delete this.data;
    delete this.url;
    delete this.originalUrl;
    delete this.provider;
  },
  
  getData: function() {
    return this.data;
  }
};