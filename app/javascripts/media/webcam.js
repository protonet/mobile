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

    snap: function(url, callback) {
      this.provider.snap(url, callback);
    },

    snapWithCountdown: function() {

    },
    
    reset: function() {
      this.provider.reset();
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
    
    snap: function(url, callback) {
      this.$canvas[0].width = this.$video[0].clientWidth;
      this.$canvas[0].height = this.$video[0].clientHeight;
      
      var ctx = this.$canvas[0].getContext("2d");
      ctx.drawImage(this.$video[0], 0, 0, this.$canvas[0].width, this.$canvas[0].height);
      
      this.$video[0].pause();
      
      var dataUri   = this.$canvas[0].toDataURL("image/jpeg"),
          imageData = window.atob(dataUri.split(",")[1]),
          ab        = new ArrayBuffer(imageData.length),
          ia        = new Uint8Array(ab);
      for (var i=0; i<imageData.length; i++) {
          ia[i] = imageData.charCodeAt(i);
      }
      
      // write the ArrayBuffer to a blob, and you're done
      var bb = new WebKitBlobBuilder();
      bb.append(ab);
      var blob = bb.getBlob("image/jpeg");
          
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.withCredentials = true;  
      // xhr.onload = function(e) { ... };
        // Listen to the upload progress.
        // xhr.upload.onprogress = function(e) { ... };
      xhr.send(blob);
      // console.dir(this.$canvas[0]);
      // console.dir(ctx)
      // $.ajax({
      //   url:          url,
      //   headers:      { "Content-Type": "image/jpeg" },
      //   type:         "POST",
      //   data:         imageData,
      //   success:      callback
      // });
    },
    
    reset: function() {
      this.video[0].play();
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
      webcam.set_shutter_sound(false);
    },

    insertInto: function($container) {
      this.$elements = $(webcam.get_html($container.width(), $container.height()));
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