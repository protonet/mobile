//= require "../lib/swfupload.js"

// this is the order in which the files are sent to the server
// 
// file queue
// file dialog complete
// upload progress
// upload error

protonet.controls.FileWidget.prototype.FileUpload = function() {
  this._fileList = $("#file-list .root");
  this._form = $("#file-stash");
  this._uploadUrl = this._form.attr("action") + "?_rails_dashboard_session=" + protonet.config.session_id;
  this._token = this._form.find("[name='authenticity_token']").val();
  
  this._oldTitle = document.title;
  this.reset();
  
  var self = this;
  this._swfUpload = new SWFUpload({
     upload_url: this._uploadUrl,
     flash_url: "flash/swfupload.swf",
     button_placeholder_id: "file-upload-flash",
     file_size_limit: "100000 MB",
     post_params: { "authenticity_token": this._token },
     button_width: 110,
     button_height: 22,
     button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
     button_cursor: SWFUpload.CURSOR.HAND,
     debug: false,
     file_types: "*.*",
     file_post_name: "file",
     file_types_description: "All Files",
     file_upload_limit: 100,
     file_queue_limit: 0,
    file_queued_handler: function() { self.file_queued_handler.apply(self, arguments); },
    file_dialog_complete_handler: function() { self.file_dialog_complete_handler.apply(self, arguments); },
    upload_progress_handler: function() { self.upload_progress_handler.apply(self, arguments); },
    upload_success_handler: function() { self.upload_success_handler.apply(self, arguments); },
    upload_error_handler: function() { self.upload_error_handler.apply(self, arguments); }
  });
};

protonet.controls.FileWidget.prototype.FileUpload.prototype = {
  file_queued_handler : function(file) {
    console.log("file queue for: " + file.name);
    this._fullSize += file.size;
    this._fileList.append('<li class="file disabled" id="file:' + file.id + '">' + file.name + " <span>(0 %)</span></li>");
  },

  file_dialog_complete_handler: function(numSelectedFiles, numFilesQueued) {
    console.log("file dialog complete");
    if (numSelectedFiles == 0) { return; }
    this._numSelectedFiles = numSelectedFiles;
    
    window.onbeforeunload = function() { return "Upload is still in progress. Are you sure?"; };

    this._swfUpload.startUpload();
    
  },
  
  upload_progress_handler: function(file, bytesLoaded, bytesTotal) {
    console.log("upload progress for: " + file.name);
    
    var percent = Math.round(bytesLoaded/bytesTotal * 100),
        fullPercent = Math.round((this._loadedSize + bytesLoaded) / this._fullSize * 100),
        status = this._fileList.find("#file:" + file.id + " span");
    status.html("(" + percent + " %)");
    
    document.title = this._oldTitle + " - Uploading " + fullPercent + " %";
  },
  
  upload_success_handler: function(file) {
    console.log("upload success for: " + file.name);
    
    this._fileList.find("#file:" + file.id + " span").remove();
    
    this._loadedSize += file.size;
    
    if (--this._numSelectedFiles > 0) {
      this._swfUpload.startUpload();
    } else {
      this.reset();
    }
  },
  
  upload_error_handler: function() {
    console.log("upload error");
    this.reset();
  },
  
  reset: function() {
    window.onbeforeunload = null;
    this._loadedSize = 0;
    this._fullSize = 0;
    this._numSelectedFiles = 0;
    document.title = this._oldTitle;
  }
};

