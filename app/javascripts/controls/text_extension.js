//= require "../data/yql.js"
//= require "../media/get_screenshot.js"

protonet.controls.TextExtension = function(args) {
  if (!args || !args.input) {
    throw new Error("TextExtension: Missing input element");
  }
  if (navigator.onLine === false) {
    return;
  }
  
  this.input = args.input;
  this.container = $("#text-extension");
  this.results = $("#text-extension-results");
  
  this.regExp = /(\S+\.{1}[^\s\,\.\!]+)/g;
  
  this._initEvents();
};

protonet.controls.TextExtension.prototype = {
  _initEvents: function() {
    this.input.bind("paste", this._paste.bind(this));
    this.input.bind("keyup", this._keyUp.bind(this));
  },
  
  _paste: function() {
    // Some jerk at w3c decided to fire the onpaste before the text is inserted
    // therefore we need to delay the parsing
    setTimeout(this._parse.bind(this), 0);
  },
  
  _keyUp: function(event) {
    var isSpaceBar = event.keyCode == 32,
        isLineBreak = event.shiftKey && event.keyCode == 13;
    
    if (isSpaceBar || isLineBreak) { this._parse(); }
  },
  
  _parse: function() {
    if (this.url) {
      return;
    }
    
    var matchUrls = this.input.val().match(this.regExp);
    if (!matchUrls) {
      return;
    }
    
    for (var i=0, url = matchUrls[i]; i<matchUrls.length; i++) {
      if (url.length > 10 && (url.startsWith("http") || url.startsWith("www."))) {
        this.url = this._prepareUrl(url);
        this._request();
        this._show();
        break;
      }
    }
  },
  
  _reset: function() {
    this._hide();
    delete this.url;
  },
  
  _request: function() {
    new protonet.data.YQL.Query(
      "SELECT * FROM html WHERE url='" + this.url + "' AND (xpath = '//meta[@name=\"description\"]' OR xpath='//title' OR xpath='//img')"
    ).execute(
      this._showResults.bind(this), // success
      this._reset.bind(this) // failure
    );
  },
  
  _showResults: function(response) {
    var data = response.query.results;
    if (!data) {
      this._reset();
      return;
    }
    
    if (data.title) {
      var title = String(data.title).truncate(75);
      this.results.find(".title").html(title);
    }
    
    var description;
    if (data.meta && data.meta.content) {
      description = String(data.meta.content).truncate(200);
    } else {
      description = this.url.truncate(50);
    }
    this.results.find(".description").html(description);
    
    this.results.find(".media").append(this._getScreenshot());
    this.results.find("a").attr("href", this.url);
    
    this._expand();
    this.results.show();
  },
  
  _show: function() {
    this.container.addClass("loading-bar");
    this.container.animate({
      height: "30px",
      opacity: 100
    }, 200);
  },
  
  _expand: function() {
    this.container.removeClass("loading-bar");
    this.container.stop().animate({
      height: "102px"
    }, 100);
  },
  
  _hide: function() {
    this.results.stop().hide();
    this.container.stop().animate({
      height: "0px",
      opacity: 0
    }, 200, function() {
      this.container.hide();
    }.bind(this));
  },
  
  _getScreenshot: function() {
    return '<img src="' + protonet.media.getScreenShot(this.url, "T") +'" height="70" width="90" />';
  },
  
  _prepareUrl: function(url) {
    if (url.startsWith("www.")) {
      url = "http://" + url;
    }
    return url;
  }
};