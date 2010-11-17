//= require "../ui/modal_window.js"
//= require "../utils/escape_html.js"

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
    this.modalWindow = protonet.ui.ModalWindow;
    
    this._observe();
  },
  
  _observe: function() {
    protonet.Notifications.bind("channel.change", function() {
      if (this.modalWindow.className == "search") {
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
      type: "get",
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
    
    var container = $("<ul />", { className: "meeps" });
    this.modalWindow.update({ content: container });
    
    data.reverse().chunk(function(meepData, i) {
      return new protonet.timeline.Meep(meepData).render(container);
    }, function(meeps) {
      meeps.chunk(function(meep) { meep.highlight(keyword); });
    });
  },
  
  renderHint: function(hint) {
    this.modalWindow.update({
      content: $("<p />", { html: hint, className: "no-meeps-available" })
    });
  }
};