//= require "../ui/modal_window.js"
//= require "../utils/escape_html.js"

protonet.timeline.Search = {
  initialize: function() {
    this.form   = $("#search-form");
    this.input  = this.form.find("input.search");
    
    this._observe();
  },
  
  _observe: function() {
    this.form.bind({
     keydown: function() {
        var value = this.input.val();
        if (value.length < 1) {
          return;
        }
        
        this.input.val("");
        this.show(value);
      }.bind(this),
      submit:   function() {
        this.show(this.input.val());
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
    
    protonet.ui.ModalWindow.update({
      headline: this.bigInput
    }).show("search");
    
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
    
    this.search(keyword);
  },
  
  search: function(keyword, callback) {
    if (keyword == this.keyword) {
      return;
    }
    
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
        protonet.ui.ModalWindow.get("dialog").addClass("loading");
      },
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
        protonet.ui.ModalWindow.get("dialog").removeClass("loading");
      }
    });
  },
  
  render: function(keyword, data) {
    if (!data.length) {
      this.renderHint("No results found");
      return;
    }
    
    var container = $("<ul />", { className: "meeps" });
    protonet.ui.ModalWindow.update({ content: container });
    
    data.reverse().chunk(function(meepData, i) {
      new protonet.timeline.Meep(meepData).render(container).highlight(keyword);
    });
  },
  
  renderHint: function(hint) {
    protonet.ui.ModalWindow.update({
      content: $("<p />", { html: hint, className: "no-meeps-available" })
    });
  }
};