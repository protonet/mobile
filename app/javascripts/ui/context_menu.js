/**
 * Creates a context menu that is visible onclick
 * It gets positioned under the trigger element
 *
 * @example
 *    var contextMenu = new protonet.ui.ContextMenu("a.foo-bar", {
 *      "say hello": function(li, closeContextMenu) {
 *        // parameter 'li' is the link on which the user clicked to open the context menu
 *        // parameter 'closeContextMenu' is a function that can be invoked in order to close the context menu
 *      },
 *      "show profile": function(li) {
 *        showProfile(li.attr("data-user-id"));
 *      }
 *    });
 *
 *    contextMenu.bind("open", function() {
 *      alert("context menu opened");
 *    });
 *
 *    contextMenu.bind("close", function() {
 *      alert("context menu closed");
 *    });
 */

protonet.ui.ContextMenu = function(selector, options) {
  this.selector = selector;
  this.options = options;
  
  this.create();
  this.observe();
};

protonet.ui.ContextMenu.prototype = {
  create: function() {
    var template  = $("<li />",   { tabIndex: -1 });
    this.list     = $("<menu />", { className: "context-menu" });
    
    $.each(this.options, function(name, callback) {
      template.clone().html(name).appendTo(this.list).data("callback", callback);
    }.bind(this));
    
    this.list.appendTo("body");
  },
  
  observe: function() {
    var root    = $("html"),
        $window = $(window),
        close   = function() {
          this.list.hide().undelegate("li", "click.context_menu");
          $window.unbind("resize.context_menu");
          root.add(this.list).unbind("mousedown.context_menu");
          this.trigger("close");
        }.bind(this);
    
    root.delegate(this.selector, "click", function(event) {
      var target = $(event.currentTarget);
      this.position(target);
      
      this.list
        .delegate("li", "click.context_menu", function(event) {
          $(this).data("callback")(target, close, event);
        })
        .bind("mousedown.context_menu", function(event) {
          event.stopPropagation();
        })
        .fadeIn(500, function() {
          this.trigger("open");
        }.bind(this));
      
      $window.bind("resize.context_menu", function() {
        this.position(target);
      }.bind(this));
      
      root.bind("mousedown.context_menu", close);
      
      event.preventDefault();
    }.bind(this));
  },
  
  position: function(target) {
    var offsets = target.offset(),
        size = { width: target.outerWidth(), height: target.outerHeight() };
    
    this.list.css({
      left: (offsets.left + (size.width / 2) - (this.list.outerWidth(true) / 2)).px(),
      top:  (offsets.top + size.height).px()
    });
  },
  
  /**
   * Possible events:
   *  - open: fired after the context menu is opened
   *  - close: fired after the context menu is closed
   */
  bind: function(eventName, callback) {
    this.list.bind("context_menu:" + eventName, callback);
    return this;
  },
  
  trigger: function(eventName, param) {
    this.list.trigger("context_menu:" + eventName, [param]);
    return this;
  }
};