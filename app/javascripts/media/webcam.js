//= require "../lib/webcam.js"

(function(media, webcam) {
  var SHUTTER_SOUND = "/sounds/shutter.mp3";
  
  function getNavigatorGetUserMedia() {
    return navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;
  }
  
  media.Webcam = Class.create({
    initialize: function() {
      for (var i in media.Webcam.provider) {
        var instance = new media.Webcam.provider[i]();
        if (instance.supported()) {
          this.provider = instance;
          break;
        }
      }
    },
    
    supported: function() {
      return !!this.provider;
    },

    snap: function() {
      
    },

    snapWithCountdown: function() {

    },
    
    insertInto: function($container) {
      this.provider.insertInto($container);
    }
  });
  
  
  // ------------------------------------- PROVIDER ------------------------------------- \\
  media.Webcam.provider = {};
  
  media.Webcam.provider.WebRTC = Class.create({
    supported: function() {
      return !!navigator.getUserMedia;
    },

    initialize: function() {
      
    },

    insertInto: function($container, success, failure) {
      this.$video = $("<video>", {
        autoplay: "autoplay"
      }).css({
        height: $container.height(),
        width:  $container.width()
      });
      
      this.$canvas = $("<canvas>").hide();
      this.$elements = this.$video.add(this.$canvas);
      $container.append(this.$elements);
      
      var successWrapper = function(stream) {
        this._success(stream);
        success && success();
      }.bind(this);
      
      try {
        navigator.getUserMedia({ video: true }, successWrapper, failure);
      } catch(e) {
        navigator.getUserMedia("video", successWrapper, failure);
      }
    },
    
    snap: function(callback) {
      
    },
    
    _success: function(stream) {
      this.$video[0].src = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(stream) : stream;
    }
  });
  
  media.Webcam.provider.Flash = Class.create({
    supported: function() {
      return protonet.browser.HAS_FLASH(9);
    },

    initialize: function() {
      webcam.set_swf_url("/flash/webcam.swf");
      webcam.set_quality(100);
    },

    insertInto: function($container) {
      this.$elements = $(webcam.get_html($container.width(), $container.height()));
      $container.append(this.$elements);
    },
    
    snap: function(callback) {
      
    }
  });
})(protonet.media, webcam);