//= require "../lib/swfupload.js"

// this is the order in which the files are sent to the server
// 
// file queue
// file dialog complete
// upload progress
// upload error

protonet.controls.FileWidget.prototype.FileUpload = function() {
  this._form = $("#file-stash");
  this._uploadUrl = this._form.attr("action");
  this._token = this._form.find("[name='authenticity_token']").val();
  
  this._oldTitle = document.title;
  
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
    console.log("file queue");
    this.fileIds = this.fileIds || [];
    this.fullSize = this.fullSize || 0;
    this.fullSize += file.size;
    this.ul = this.ul || $("#file-list .root");
    this.liElements = this.liElements || [];
    this.statusElements = this.statusElements || [];
    this.fileIds.push(file.id);
    this.liElements[file.id] = $(document.createElement("li"));
    this.liElements[file.id].html(file.name + " <span>(0 %)</span>");
    this.ul.append(this.liElements[file.id]);
    this.statusElements[file.id] = this.liElements[file.id].find("span");
  },

  file_dialog_complete_handler: function(numSelectedFiles) {
    console.log("file dialog complete");
    
    if (numSelectedFiles == 0) { return; }
    
    window.onbeforeunload = function() { return "Upload is still in progress. Are you sure?"; };
    // this._swfUpload.startUpload(this.fileIds.shift());
    this._swfUpload.startUpload();
    
  },
  
  upload_progress_handler: function(file, bytesLoaded, bytesTotal) {
    console.log("upload progress");
    
    var percent = Math.round(bytesLoaded/bytesTotal*100);
    var fullPercent = Math.round((this.loadedSize + bytesLoaded) / this.fullSize * 100);
    this.statusElements[file.id].html(" (" + percent + " %)");
    document.title = this.backupTitle + " - Uploading " + fullPercent + " %";
  },
  
  upload_success_handler: function(file) {
    console.log("upload success");
    
    this.loadedSize += file.size;
    this.liElements[file.id].html('<a href="/uploads/' + file.name + '">' + file.name + '</a>');
    if (this.fileIds.length > 0) {
      this._swfUpload.startUpload(this.fileIds.shift());
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
    this.loadedSize = 0;
    document.title = this._oldTitle;
  }
};

