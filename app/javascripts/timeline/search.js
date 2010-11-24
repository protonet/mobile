//= require "../ui/modal_window.js"
//= require "../utils/escape_html.js"
//= require "../lib/jquery.inview/jquery.inview.js"

/**
 * TODO:
 *  - Endless scrolling
 *  - Fix scrolling performance on webkit
 *  - Show messages in context
 *  - Speed!
 */
protonet.timeline.Search = {
  initialize: function() {
    this.form        = $("#search-form");
    this.input       = this.form.find("input.search");
    this.meepList    = $("<ul />", { className: "meeps" });
    this.modalWindow = protonet.ui.ModalWindow;
    
    this._observe();
  },
  
  _observe: function() {
    protonet.Notifications.bind("channel.change", function() {
      if (this.modalWindow.getClassName() == "search") {
        this.modalWindow.hide();
      }
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
    if (this.currentXhr) {
      this.currentXhr.aborted = true;
      this.currentXhr.abort();
      this.currentXhr = null;
    }
  },
  
  show: function(keyword) {
    this.bigInput = this.bigInput || $("<input />", { className: "search" });
    
    this.modalWindow.update({
      headline: this.bigInput
    }).show("search");
    
    this.input.val("");
    this.bigInput
      .bind({
        keydown:   function() {
          clearTimeout(this.timeout);
        }.bind(this),
        keyup:     function() {
          this.timeout = setTimeout(function() { this.search(this.bigInput.val()); }.bind(this), 200);
        }.bind(this)
      })
      .val(keyword)
      .get(0)
      .focus();
    
    this.bigInput.trigger("keyup");
  },
  
  search: function(keyword, callback) {
    if (keyword == this.keyword) {
      return;
    }
    
    this.page    = 1;
    this.keyword = keyword;
    
    if (!keyword) {
      this.renderHint( "Please enter a keyword");
      return;
    }
    this._cancel();
    
    this.currentXhr = $.ajax({
      data: {
        search_term: keyword,
        channel_id:  0
      },
      url:     "/search",
      beforeSend: function() {
        setTimeout(function() {
          this.modalWindow.get("dialog").addClass("loading");
        }.bind(this), 0);
      }.bind(this),
      success: this.render.bind(this, keyword),
      error:   function(xhr) {
        if (xhr.aborted) {
          return;
        }
        protonet.Notifications.trigger(
          "flash_message.error",
          protonet.t("SEARCH_ERROR").replace("{keyword}", keyword)
        );
      }.bind(this),
      complete: function(xhr) {
        if (xhr.aborted) {
          return;
        }
        this.modalWindow.get("dialog").removeClass("loading");
      }.bind(this)
    });
  },
  
  /**
   * TODO: Need for speed here, OPTIMIZE the shit out of this (cblum)
   */
  render: function(keyword, data) {
    if (!data.length) {
      this.renderHint("No results found");
      return;
    }
    
    this.modalWindow.update({ content: this.meepList.html("") });
    
    data.reverse().chunk(function(meepData, i) {
      return new protonet.timeline.Meep(meepData).render(this.meepList);
    }.bind(this), function(meeps) {
      meeps.chunk(function(meep) { meep.highlight(keyword); }, this._afterRendering.bind(this));
    }.bind(this));
  },
  
  renderHint: function(hint) {
    this.modalWindow.update({
      content: $("<p />", { html: hint, className: "no-meeps-available" })
    });
  },
  
  _afterRendering: function() {
    this._initEndlessScrolling();
  },
  
  _initEndlessScrolling: function() {
    var lastMeepInList = this.meepList.children(":last").addClass("separator");
    
    lastMeepInList.one("inview", function(event, visible) {
      if (!visible) {
        return;
      }
      
      var lastMeepId = lastMeepInList.data("meep").id;
      console.log("LOAD MORE");
    }.bind(this));
  }
};