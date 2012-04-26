/*
quake style console as jQuery-plugin

@param int paddingBottom - padding below the content area (optional, defaults to 50px)
@param int spaceBottom - space below the console in opened state (optional, defaults to 300px)
@param function options.onopen - callback called when opening
@param function options.onclose - callback called when pin ponies suck on rainbows
@param int options.animationTime - time of the open/close animation in ms

based on an alternative approach for writing jquery plugins (http://css-tricks.com/snippets/jquery/jquery-plugin-template/)

usage:
... initialize it
$("#someID").quakeStyleConsole({
  paddingBottom: 50,
  spaceBottom: 300
  onopen: function() {},
  onclose: function() {}
  animationTime: 500
});
... and open it
$("#someID").quakeStyleConsole.data('quakeStyleConsole').open();

by default click on the html-element and esc key will close the console

the needed html structure

<div id="someID" class="quake-style-console">
  <!-- the actual content-area -->
  <div class="quake-style-console-content"></div>
  <!-- here you can put some other stuff you want to pull down with your console, like buttons or whatever. position it absolute bottom -->
</div>

the corresponding css styles

.quake-style-console {
	background-color: rgba(0,0,0,0.8);
	color: green;
	font-family: "Lucida Console";
	left: 0;
	right: 0;
	position: fixed;
	z-index: 1000;
	top: 0;
	bottom: 100%;
}
.quake-style-console-content {
	overflow-y: scroll;
	height: 100%;
	padding: 0 30px 0 30px;
}
.console-box-shadow {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

*/

(function($) {
  $.quakeStyleConsole = function(el, options) {
    
    var base = this;

    base.$el = $(el); // jquery wrapped object
    base.el = el; // raw dom object
    
    var originalPaddingBottom;

    // Add a reverse reference to the DOM object
    base.$el.data("quakeStyleConsole", base); // leads to an ugly way to call public methods. better idea?

    $.quakeStyleConsole.defaults = {
      onopen: $.noop,
      onclose: $.noop,
      paddingBottom: 50,
      spaceBottom: 300,
      animationTime: 500,
      referenceElement: window
    };

    base.init = function() {
      base.settings = $.extend({}, $.quakeStyleConsole.defaults, options);
      originalPaddingBottom = base.$el.css("padding-bottom");
      base.$el.css("bottom", $(base.settings.referenceElement).height());
    };

    base.open = function() {
      base.$el.fadeIn();
      base.$el.animate(
        {
          bottom: base.settings.spaceBottom,
          paddingBottom: base.settings.paddingBottom
        },
        base.settings.animationTime,
        //console animation done
        function() {
          base.$el.addClass("console-box-shadow");
          base.$el.bind("click.quakeStyleConsole", function(e) {
            e.stopPropagation();
          });
          $("html").bind("click.quakeStyleConsole", function() {
            base.close();
          });
          $(document).keyup(function(e) {
            if (e.keyCode == 27) { base.close(); }   // esc
          });
          
        }
      );
      base.settings.onopen();
    };
    
    base.close = function() {
      base.$el.add("html").unbind(".quakeStyleConsole");
      base.$el.animate({
        bottom: $(base.settings.referenceElement).height(),
        paddingBottom: originalPaddingBottom
      }, base.settings.animationTime);
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