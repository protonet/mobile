//= require "../pages/superclass.js"
//= require "../lib/jquery.inview/jquery.inview.js"


protonet.pages.Search = Class.create(protonet.Page, {
  initialize: function($super) {
    this.form        = $("#search-form");
    this.input       = this.form.find("input.search");
    
    this.meepList    = $("<ul />",  { className: "meeps" });
    this.bigInput    = $("<input>", { className: "search" });
    
    $super("search", {
      url:            "/search?search_term={state}",
      resultsPerPage: 10,
      request:        false
    });
  },
  
  _observe: function($super) {
    this.bigInput.bind({
      keydown:   function() {
        clearTimeout(this.timeout);
      }.bind(this),
      keyup:     function() {
        this.timeout = setTimeout(function() {
          this.search(this.bigInput.val());
        }.bind(this), 200);
      }.bind(this)
    });
    
    $super();
  },
  
  _initDependencies: function($super) {
    var isTouchDevice = protonet.user.Browser.IS_TOUCH_DEVICE();
    
    this.form.bind({
      keydown: function() {
        if (isTouchDevice) {
          return;
        }
        
        var value = this.input.val();
        if (value.length < 1) {
          return;
        }
        
        setTimeout(function() {
          this.show(this.input.val());
          this.input.val("").blur();
        }.bind(this), 0);
        
      }.bind(this),
      submit:   function(event) {
        var value = this.input.val();
        this.input.val("");
        this.show(value);
        event.preventDefault();
      }.bind(this)
    });
    
    $super();
  },
  
  show: function($super, keyword) {
    if (!this.visible) {
      $super(keyword);
      this.keyword = null;
      this.headline(this.bigInput);
    }
    
    this.update(keyword);
  },
  
  update: function(keyword) {
    this.bigInput.val(keyword).focus();
    this.search(keyword);
  },
  
  _cancel: function() {
    if (!this.currentXhr) {
      return;
    }
    
    this.currentXhr.aborted = true;
    this.currentXhr.abort();
    this.currentXhr = null;
  },
  
  load: function(keyword, pageNum, callback) {
    this._cancel();
    
    this.currentXhr = $.ajax({
      data: {
        search_term:    keyword,
        results_count:  this.config.resultsPerPage,
        channel_id:     0,
        page:           pageNum || 1
      },
      url: "/search",
      beforeSend: function() {
        this.elements.dialog.addClass("loading");
      }.bind(this),
      success: function(data) {
        callback && callback(data);
      },
      complete: function(xhr) {
        if (xhr.aborted) {
          return;
        }
        this.elements.dialog.removeClass("loading");
      }.bind(this)
    });
  },
  
  search: function(keyword) {
    if (keyword == this.keyword) {
      return;
    }
    
    this.pageNum = 1;
    this.keyword = keyword;
    this.setState(keyword);
    
    if (!keyword) {
      this.renderHint("Please enter a keyword");
      return;
    }
    
    this.content(this.meepList.html(""));
    
    this.load(keyword, this.pageNum, function(data) {
      this.render(this.meepList, data, this._afterRendering.bind(this));
    }.bind(this));
  },
  
  /**
   * TODO: Need for speed here, OPTIMIZE the shit out of this (cblum)
   */
  render: function(container, data, callback) {
    if (!data.length && this.pageNum == 1) {
      this.renderHint("No results found");
      return;
    }
    
    data.reverse().chunk(function(meepData) {
      return new protonet.timeline.Meep(meepData).render(container);
    }, function(meeps) {
      meeps.chunk(function(meep) { meep.highlight(this.keyword); }.bind(this), callback);
    }.bind(this));
  },
  
  renderHint: function(hint) {
    this.content($("<p />", { html: hint, className: "no-meeps-available" }));
  },
  
  _afterRendering: function(meeps) {
    if (meeps.length >= this.RESULTS_COUNT) {
      this._initEndlessScrolling();
    }
  },
  
  _initEndlessScrolling: function(key) {
    var lastMeepInList = this.meepList.children(":last").addClass("separator");
    
    lastMeepInList.one("inview", function(event, visible) {
      if (!visible) {
        return;
      }
      
      this.indicator = (this.indicator || $("<div>", { className: "meep-loading-indicator" })).insertAfter(this.meepList).show();
      
      this.load(this.keyword, ++this.pageNum, function(data) {
        var tempContainer = $("<ul>");
        this.render(tempContainer, data, function(meeps) {
          this.meepList.append(tempContainer.children());
          this._afterRendering(meeps);
          this.indicator.remove();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
});