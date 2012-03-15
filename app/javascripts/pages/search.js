protonet.pages.Search = {
  config: {
    resultsPerPage: 10
  },
  
  initialize: function() {
    this.$page      = $(".search-page");
    
    if (!this.$page.length) {
      return;
    }
    
    this.$container = this.$page.find("output");
    this.$form      = this.$page.find("form");
    this.$input     = this.$form.find("input[type=search]");
    
    this.$meepList  = $("<ul>", { "class": "meeps" });
    
    var isModalWindow = $(".modal-window").length > 0;

    function resizeContainer() {
      if (!isModalWindow) {
        this.$container.css("min-height", $(window).height() - this.$container.offset().top + "px");
      }
    }

    $(window).resize(resizeContainer.bind(this));
    resizeContainer.call(this);
    
    this._observe();
    
    if (this.$input.val()) {
      this.$form.trigger("submit");
    } else {
      this.renderHint("PLEASE_ENTER_KEYWORD");
    }
    
    this.$input.focus();
  },
  
  _observe: function() {
    this.$input.bind({
      keydown:   function() {
        clearTimeout(this.timeout);
      }.bind(this),
      keyup:     function() {
        this.timeout = setTimeout(function() {
          this.search(this.$input.val());
        }.bind(this), 200);
      }.bind(this)
    });
    
    this.$form.bind({
      submit: function(event) {
        this.search(this.$input.val());
        event.preventDefault();
      }.bind(this)
    });
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
    
    pageNum = pageNum || 1;
    
    this.currentXhr = $.ajax({
      data: {
        search_term:    keyword,
        results_count:  this.config.resultsPerPage,
        channel_id:     0,
        page:           pageNum || 1
      },
      dataType:   "json",
      url:        "/search",
      beforeSend: function() {
        if (pageNum === 1) {
          this.$page.addClass("loading");
        }
      }.bind(this),
      success: function(data) {
        (callback || $.noop)(data);
      },
      complete: function(xhr) {
        if (xhr.aborted) {
          return;
        }
        this.$page.removeClass("loading");
      }.bind(this)
    });
  },
  
  search: function(keyword) {
    if (keyword === this.keyword) {
      return;
    }
    
    this.pageNum = 1;
    this.keyword = keyword;
    
    protonet.utils.History.push("/search?search_term=" + encodeURIComponent(keyword));
    
    if (!keyword) {
      this.renderHint("PLEASE_ENTER_KEYWORD");
      return;
    }
    
    if (this.$meepList.parent() !== this.$container) {
      this.$container.html(this.$meepList);
    }
    
    this.load(keyword, this.pageNum, function(data) {
      this.render(this.$meepList, data, this._afterRendering.bind(this));
    }.bind(this));
  },
  
  /**
   * TODO: Need for speed here, OPTIMIZE the shit out of this (cblum)
   */
  render: function($container, data, callback) {
    $container.empty();
    if (!data.length && this.pageNum === 1) {
      this.renderHint("NO_RESULTS_FOUND");
      return;
    }
    
    data.reverse().chunk(function(meepData) {
      return new protonet.timeline.Meep(meepData).render($container);
    }, function(meeps) {
      meeps.chunk(function(meep) { meep.highlight(this.keyword); }.bind(this), callback);
    }.bind(this));
  },
  
  renderHint: function(textResourceKey) {
    this.$container.html($("<p>", { text: protonet.t(textResourceKey), "class": "no-meeps-available" }));
  },
  
  _afterRendering: function(meeps) {
    if (meeps.length >= this.config.resultsPerPage) {
      this._initEndlessScrolling();
    }
  },
  
  _initEndlessScrolling: function(key) {
    var lastMeepInList = this.$meepList.children(":last");
    
    lastMeepInList.one("inview", function(event, visible) {
      if (!visible) {
        return;
      }
      
      this.$indicator = (this.$indicator || $("div>", { "class": "progress" })).insertAfter(this.$meepList).show();
      
      this.load(this.keyword, ++this.pageNum, function(data) {
        var $tempContainer = $("<ul>");
        this.render($tempContainer, data, function(meeps) {
          this.$meepList.append($tempContainer.children());
          this._afterRendering(meeps);
          this.$indicator.remove();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
};

protonet.p("search", function() {
  protonet.pages.Search.initialize();
});
