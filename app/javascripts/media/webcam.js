//= require "../lib/webcam.js"
//= require "play_sound.js"

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
      return !!this.provider && !!window.WebKitBlobBuilder;
    },

    snap: function(url, callback) {
      this.provider.snap(url, callback);
    },

    snapWithCountdown: function(url, callback) {
      var i          = 3,
          $countdown = $("<div>", { "class": "countdown", text: i }).insertAfter(this.$container),
          interval   = setInterval(function() {
        i--;
        if (i < 1) {
          $countdown.hide();
          clearInterval(interval);
          var $flash = $("<div>", { "class": "flash" }).insertAfter(this.$container).hide();
          $flash.fadeIn(300, function() {
            $countdown.show().addClass("status").text(protonet.t("UPLOADING_SNAPSHOT"));
            this.snap(url, function() {
              $countdown.remove();
              callback.apply(this, arguments);
            });
            $flash.remove();
          }.bind(this));
        } else {
          $countdown.text(i);
        }
      }.bind(this), 1000);
    },
    
    reset: function() {
      this.provider.reset();
    },
    
    insertInto: function($container) {
      this.$container = $container;
      this.provider.insertInto($container);
    }
  });
  
  
  // ------------------------------------- PROVIDER ------------------------------------- \\
  media.Webcam.provider = {};
  
  media.Webcam.provider.WebRTC = Class.create({
    supported: function() {
      return !!navigator.getUserMedia;
    },

    initialize: function() {},

    insertInto: function($container, success, failure) {
      this.$video = $("<video>", { autoplay: "autoplay" });
      
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
    
    snap: function(url, callback) {
      protonet.media.playSound(SHUTTER_SOUND);
      
      var canvas = this.$canvas[0], video = this.$video[0];
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      
      video.pause();
      
      var dataUri   = canvas.toDataURL("image/jpeg"),
          imageData = atob(dataUri.split(",")[1]),
          ab        = new ArrayBuffer(imageData.length),
          ia        = new Uint8Array(ab);
      for (var i=0; i<imageData.length; i++) {
        ia[i] = imageData.charCodeAt(i);
      }
      
      var bb = new WebKitBlobBuilder();
      bb.append(ab);
      var blob = bb.getBlob("image/jpeg");
      
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.withCredentials = true;
      xhr.onload = function() {
        callback(JSON.parse(xhr.responseText));
      };
      xhr.send(blob);
    },
    
    reset: function() {
      this.$video[0].play();
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
      webcam.set_shutter_sound(true, SHUTTER_SOUND);
    },

    insertInto: function($container) {
      var width = $container.width(), height = $container.height();
      this.$elements = $(webcam.get_html(width, height));
      $container.append(this.$elements);
    },
    
    reset: function() {
      webcam.reset();
    },
    
    snap: function(url, callback) {
      webcam.snap(url, function(responseText) {
        callback(JSON.parse(responseText));
      });
    }
  });
})(protonet.media, webcam);