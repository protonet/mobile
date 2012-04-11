// quake style console as jQuery-plugin
// TODO: put in own file. css too (currently in preferences.css)
// @param function options.onOpen - callback called when opening
// @param function options.onClose - callback called when pin ponies suck on rainbows

// based on an alternative approach for writing jquery plugins (http://css-tricks.com/snippets/jquery/jquery-plugin-template/)

(function($) {
  $.quakeStyleConsole = function(el, options) {
    
    var base = this;

    base.$el = $(el); // jquery wrapped object
    base.el = el; // raw dom object
    
    var originalPaddingBottom;
    var originalBottom;

    // Add a reverse reference to the DOM object
    base.$el.data("quakeStyleConsole", base); // leads to an ugly way to call public methods. better idea?

    $.quakeStyleConsole.defaults = {
      onopen: $.noop,
      onclose: $.noop,
      paddingBottom: 50,
      spaceBottom: 300
    };

    base.init = function() {
      base.settings = $.extend({}, $.quakeStyleConsole.defaults, options);
      originalPaddingBottom = base.$el.css("padding-bottom");
      originalBottom = base.$el.css("bottom");
    };

    base.open = function() {
      base.$el.fadeIn();
      base.$el.animate(
        {
          bottom: base.settings.spaceBottom,
          paddingBottom: base.settings.paddingBottom
        },
        1000,
        //console animation done
        function() {
          base.$el.addClass("console-box-shadow");
          base.$el.bind("click.quakeStyleConsole", function(e) {
            e.stopPropagation();
          });
          $("html").bind("click.quakeStyleConsole", function() {
            base.close();
          });
        }
      );
      base.settings.onopen();
    };
    
    base.close = function() {
      base.$el.add("html").unbind(".quakeStyleConsole");
      base.$el.animate({
        bottom: originalBottom,
        paddingBottom: originalPaddingBottom
      }, 1000);
      base.$el.removeClass("console-box-shadow");
      base.settings.onclose();
    };

    base.init();
  };

  $.fn.quakeStyleConsole = function(options){
    return this.each(function() {
      new $.quakeStyleConsole(this, options);
      // do more stuff here?
    });
  };
})(jQuery);