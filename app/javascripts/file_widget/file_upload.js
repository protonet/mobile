//= require "../lib/swfupload.js"

protonet.controls.FileWidget.prototype.FileUpload = function() {
  var self = this;
  this._swfUpload = new SWFUpload({
    upload_url: protonet.config.upload_url,
    flash_url:  protonet.config.swfupload_flash_url,
    file_size_limit: "100000 MB",
    file_types: "*.*",
    file_post_name: "file",
    file_types_description: "All Files",
    file_upload_limit: 100,
    file_queue_limit: 0,
    debug: false,
    button_placeholder_id: "file-upload-flash",
    // TODO: better way: take it from our css, it's already defined there
    button_width: 110,
    button_height: 22,
    button_window_mode: 'transparent',
    // TODO: Fetch class from seperate css file
    button_cursor: SWFUpload.CURSOR.HAND,
    file_queued_handler: function() { self.file_queued_handler.apply(self, arguments); },
    file_dialog_complete_handler: function() { self.file_dialog_complete_handler(); },
    upload_progress_handler: function() { self.upload_progress_handler.apply(self, arguments); },
    upload_success_handler: function() { self.upload_success_handler.apply(self, arguments); },
    upload_error_handler: function() { self.upload_error_handler.apply(self, arguments); }
  });

};

protonet.controls.FileWidget.prototype.FileUpload.prototype = {
  file_queued_handler : function(file) {
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

  file_dialog_complete_handler: function() {
    if (!this.fileIds || !this.fileIds.length) { return; }
    window.onbeforeunload = function() { return "Upload is still in progress. Are you sure?"; };
    this.backupTitle = document.title;
    this.loadedSize = this.loadedSize || 0;
    this._swfUpload.startUpload(this.fileIds.shift());
  },
  
  upload_progress_handler: function(file, bytesLoaded, bytesTotal) {
    var percent = Math.round(bytesLoaded/bytesTotal*100);
    var fullPercent = Math.round((this.loadedSize + bytesLoaded) / this.fullSize * 100);
    this.statusElements[file.id].html(" (" + percent + " %)");
    document.title = this.backupTitle + " - Uploading " + fullPercent + " %";
  },
  
  upload_success_handler: function(file) {
    this.loadedSize += file.size;
    this.liElements[file.id].html('<a href="/uploads/' + file.name + '">' + file.name + '</a>');
    if (this.fileIds.length > 0) {
      this._swfUpload.startUpload(this.fileIds.shift());
    } else {
      window.onbeforeunload = null;
      document.title = this.backupTitle;
    }
  },
  upload_error_handler: function() {
    window.onbeforeunload = null;
  }
};

