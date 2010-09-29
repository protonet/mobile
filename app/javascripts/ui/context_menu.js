/**
 * Creates a context menu that is visible onclick
 *
 * @example
 *    new protonet.ui.ContextMenu("a.foo-bar", {
 *      "say hello": function() {},
 *      "show profile": function() {}
 *    });
 */

protonet.ui.ContextMenu = function(selector, options) {
  this.options = options;
  this.selector = selector;
  
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
        });
      
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
    }).fadeIn(500);
  }
};