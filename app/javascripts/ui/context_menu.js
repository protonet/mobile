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
    var template = $("<li />", { tabIndex: -1 });
    this.list = $("<ul />", { className: "context-menu" });
    $.each(this.options, function(name, callback) {
      template.clone().html(name).appendTo(this.list).data("callback", callback);
    }.bind(this));
    
    this.list.appendTo("body").mousedown(function(event) { event.stopPropagation(); });
  },
  
  observe: function() {
    var root = $("html");
    root.delegate(this.selector, "click", function(event) {
      var target = $(event.currentTarget),
          offsets = target.offset(),
          size = { width: target.outerWidth(), height: target.outerHeight() };
      
      this.list.css({
        left: (offsets.left + (size.width / 2) - (this.list.outerWidth(true) / 2)).px(),
        top: (offsets.top + size.height).px()
      }).fadeIn(500);
      
      this.list.delegate("li", "click.context_menu", function() {
        $(this).data("callback")(target, function() { root.trigger("mousedown.context_menu"); });
      });
      
      root.bind("mousedown.context_menu", function() {
        this.list.hide().undelegate("li", "click.context_menu");
        root.unbind("mousedown.context_menu");
      }.bind(this));
      
      event.preventDefault();
    }.bind(this));
  }
};