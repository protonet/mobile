//= require "../utils/escape_html.js"
//= require "../utils/parse_query_string.js"
//= require "../lib/jquery.inview/jquery.inview.js"

/**
 * TODO:
 *  - Endless scrolling
 *  - Fix scrolling performance on webkit
 *  - Show messages in context
 *  - Speed!
 */
protonet.window.Search = {
  RESULTS_COUNT: 10,
  
  currentXhrs: [],
  
  initialize: function() {
    this.form        = $("#search-form");
    this.input       = this.form.find("input.search");
    this.meepList    = $("<ul />", { className: "meeps" });
    this.modalWindow = protonet.ui.ModalWindow;
    
    this._observe();
  },
  
  _observe: function() {
    protonet.utils.History.observe(/(?:\?|&)search=(.*?)(?:&|#|$)/, this.show.bind(this));
    
    protonet.Notifications.bind("modal_window.hidden", function() {
      this.keyword = null;
    }.bind(this));
    
    this.form.bind({
     keydown: function() {
        var value = this.input.val();
        if (value.length < 1) {
          return;
        }
        
        this.input.val("");
        this.show(value);
      }.bind(this),
      submit:   function(event) {
        var value = this.input.val();
        this.input.val("");
        this.show(value);
        event.preventDefault();
      }.bind(this)
    });
  },
  
  _cancel: function() {
    $.each(this.currentXhrs, function(i, xhr) {
      xhr.aborted = true;
      xhr.abort();
    });
    
    this.currentXhrs = [];
  },
  
  show: function(keyword) {
    this.bigInput = this.bigInput || $("<input />", { className: "search" });
    
    this.modalWindow.update({
      headline: this.bigInput,
      content:  ""
    }).show({ className: "search-window" });
    
    this.input.val("");
    this.bigInput
      .bind({
        keydown:   function() {
          clearTimeout(this.timeout);
        }.bind(this),
        keyup:     function() {
          this.timeout = setTimeout(function() {
            this.search(this.bigInput.val());
          }.bind(this), 200);
        }.bind(this)
      })
      .val(keyword)
      .get(0)
      .focus();
    
    this.bigInput.trigger("keyup");
  },
  
  load: function(keyword, page, callback) {
    this._cancel();
    
    this.currentXhrs.push($.ajax({
      data: {
        search_term:    keyword,
        results_count:  this.RESULTS_COUNT,
        channel_id:     0,
        page:           page || 1
      },
      url: "/search",
      beforeSend: function() {
        this.modalWindow.get("dialog").addClass("loading");
      }.bind(this),
      success: function(data) {
        callback && callback(data);
      },
      complete: function(xhr) {
        if (xhr.aborted) {
          return;
        }
        this.modalWindow.get("dialog").removeClass("loading");
      }.bind(this)
    }));
  },
  
  search: function(keyword, callback) {
    if (keyword == this.keyword) {
      return;
    }
    
    // Create history entry
    protonet.utils.History.register("?search=" + encodeURIComponent(keyword));
    
    this.page    = 1;
    this.keyword = keyword;
    
    if (!keyword) {
      this.renderHint("Please enter a keyword");
      return;
    }
    
    this.modalWindow.update({ content: this.meepList.html("") });
    
    this.load(keyword, this.page, function(data) {
      this.render(this.meepList, data, this._afterRendering.bind(this));
    }.bind(this));
  },
  
  /**
   * TODO: Need for speed here, OPTIMIZE the shit out of this (cblum)
   */
  render: function(container, data, callback) {
    if (!data.length && this.page == 1) {
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
    this.modalWindow.update({
      content: $("<p />", { html: hint, className: "no-meeps-available" })
    });
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
      
      this.load(this.keyword, ++this.page, function(data) {
        var tempContainer = $("<ul>");
        this.render(tempContainer, data, function(meeps) {
          this.meepList.append(tempContainer.children());
          this._afterRendering(meeps);
          this.indicator.remove();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
};