protonet.ui.FileQueue = (function() {
  var collapsed = true,
      $container,
      $list;
  
  return {
    initialize: function() {
      if (!$container) {
        $container = new protonet.utils.Template("file-queue-template").toElement();
        $list = $("<ol>").appendTo($container);
        this._observe();
      }
      
      return this.show();
    },
    
    add: function(file) {
      var $item = $("<li>"),
          $link = $("<a>", {
            href:     file.name,
            text:     file.name,
            "class":  "file"
          }).appendTo($item);
      
      $item.appendTo($list);
      if (collapsed) {
        this.expand();
      }
      
      return this;
    },
    
    remove: function(file) {
      
    },
    
    show: function() {
      $container.appendTo(".inner-body").css("bottom", (-$list.outerHeight()).px());
      return this;
    },
    
    hide: function() {
      $container.detach();
      return this;
    },
    
    expand: function() {
      this._animateTo(0).then(function() {
        collapsed = false;
      });
      return this;
    },
    
    collapse: function() {
      this._animateTo((-$list.outerHeight()).px()).then(function() {
        collapsed = true;
      });
      return this;
    },
    
    toggle: function() {
      collapsed ? this.expand() : this.collapse();
      return this;
    },
    
    _animateTo: function(bottom) {
      var deferred = $.Deferred();
      $container.animate({ bottom: bottom }, "fast", deferred.resolve);
      return deferred;
    },
    
    _observe: function() {
      $container.on("click", ".status", this.toggle.bind(this));
    }
  };
})();