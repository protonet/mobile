//= require "../../lib/soundmanager2/berniecode-animator.js"
//= require "../../lib/soundmanager2/excanvas.js"
//= require "../../lib/soundmanager2/360player.protonet.js"
//= require "../utils/parse_query_string.js"
//= require "../utils/parse_url.js"
//= require "../utils/parse_uri_list.js"

(function() {
  var threeSixtyPlayer;
  
  var defaultConfig = {
    autoPlay: true,
    playlist: true
  };
  
  protonet.ui.AudioPlayer = Class.create({
    initialize: function(src, config) {
      this.config = $.extend({}, defaultConfig, config);
      this.track  = 1;
      this.src    = $.makeArray(src);
    },

    renderInto: function($container) {
      this.$playerOutput = $("<output>", { data: { inDomTree: 1 } });
      $container.html(this.$playerOutput);
      
      this.$list = this._createPlaylist();
      if (this.config.playlist) {
        $container.append(this.$list);
      }
      
      this.play(this.$list.children().first());
      
      // TODO: DOMNodeRemoved
      var interval = setInterval(function() {
        if (!this.$playerOutput.data("inDomTree")) {
          clearInterval(interval);
          protonet.ui.Droppables.remove(droppable);
          this.stop();
        }
      }.bind(this), 250);
      
      var droppable = {
        elements: $container,
        types:    ["text/plain"],
        ondrop:   function($element, event) {
          var dataTransfer = event.dataTransfer,
              uriList      = dataTransfer.getData("text/plain"),
              urls         = protonet.utils.parseUriList(uriList);
          this.add(urls);
          event.preventDefault();
        }.bind(this)
      };
      
      protonet.ui.Droppables.add(droppable);
    },
    
    next: function() {
      var $next = this.$list.find(".selected").next();
      if ($next.length) {
        this.play($next);
      } else {
        this.finished = true;
      }
    },
    
    play: function($item) {
      this.stop();
      
      $item.addClass("selected");
      var src = $item.data("src");
      
      this.$player = this._createPlayer(src);
      this.$playerOutput.html(this.$player);
      
      threeSixtyPlayer = new ThreeSixtyPlayer();
      threeSixtyPlayer.config.autoPlay = !protonet.browser.IS_TOUCH_DEVICE();
      threeSixtyPlayer.config.useWaveformData = true;
      threeSixtyPlayer.config.useEQData = true;
      threeSixtyPlayer.config.onfinish = this.next.bind(this);
      
      this.finished = false;
      
      soundManager.onready(function() {
        threeSixtyPlayer.init(this.$player[0]);
      }.bind(this));
    },
    
    stop: function(avoidRemovingClass) {
      if (!avoidRemovingClass) {
        this.$list.find(".selected").removeClass("selected");
      }
      
      if (threeSixtyPlayer && threeSixtyPlayer.lastSound) {
        threeSixtyPlayer.lastSound.destruct();
      }
    },
    
    add: function(src) {
      src = $.makeArray(src);
      this.src = this.src.concat(src);
      
      $.each(src, function(i, src) {
        this._createPlaylistItem(this.$list, src);
      }.bind(this));
      
      if (this.finished) {
        this.next();
      }
    },
    
    _createPlaylist: function() {
      var $list = $("<ol>", { "class": "playlist" });
      
      $.each(this.src, function(i, src) {
        this._createPlaylistItem($list, src);
      }.bind(this));
      
      $list.on("click", "li:not(.selected)", function(event) {
        this.play($(event.currentTarget));
      }.bind(this));
      
      $list.on("click", ".remove", function(event) {
        var $item = $(event.currentTarget).parents("li");
        if ($item.is(".selected")) {
          this.stop(true);
          this.next();
        }
        $item.fadeOut("fast", function() {
          $item.remove();
        });
        event.stopPropagation();
      }.bind(this));
      
      return $list;
    },
    
    _createPlaylistItem: function($list, src) {
      var isFileDownloadUrl = src.indexOf("/fs/download") !== -1,
          isFileViewUrl     = src.startsWith(protonet.data.File.getBaseUrl()),
          name,
          path;
      
      if (isFileDownloadUrl) {
        path = protonet.utils.parseQueryString(src).paths;
        name = protonet.data.File.getName(path);
      } else if (isFileViewUrl) {
        path = protonet.utils.parseQueryString(src).path;
        name = protonet.data.File.getName(path);
        src = protonet.data.File.getDownloadUrl(path);
      } else {
        name = protonet.utils.parseUrl(src).filename;
      }
      
      var $remove = $("<a>", { "class": "remove", html: "&times;" });
      
      var $item = $("<li>", {
        text:       name,
        title:      name,
        "data-src": src
      });
      
      $remove.appendTo($item);
      $item.appendTo($list);
    },
    
    _createPlayer: function(src) {
      var $element = $("<div>", { "class": "ui360 ui360-vis" }),
          $link    = $("<a>", { "href": src }).appendTo($element);
      return $element;
    }
  });
})();
