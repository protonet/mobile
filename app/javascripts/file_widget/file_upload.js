//= require "../lib/swfupload.js"

// this is the order in which the files are sent to the server
// 
// file queue
// file dialog complete
// upload progress
// upload error

protonet.controls.FileWidget.prototype.FileUpload = function(parent) {
  this.parent = parent;
  if (!this.parent) {
    throw new Error("FileUpload: Missing instance of parent class \"FileWidget\"");
  }
  this._initElements();
  this._initForm();
  this._initTitle();
  this._reset();
  
  this._initSwfUpload();
};

protonet.controls.FileWidget.prototype.FileUpload.prototype = {
  _initElements: function() {
    this._fileList = $("#file-list .root");
    this._form = $("#file-stash");
  },
  
  _initForm: function() {
    // TODO serialize form
    this._uploadUrl = this._form.attr("action") + "?_rails_dashboard_session=" + protonet.config.session_id;
    this._token = this._form.find("[name='authenticity_token']").val();
  },
  
  _initTitle: function() {
    this._oldTitle = document.title;
  },
  
  _reset: function() {
    this._loadedSize = 0;
    this._fullSize = 0;
    this._numSelectedFiles = 0;
    window.onbeforeunload = null;
    document.title = this._oldTitle;
  },
  
  _proceed: function() {
    if (--this._numSelectedFiles > 0) {
      this._swfUpload.startUpload();
    } else {
      this._reset();
      this.parent.initContextMenu();
    }
  },
  
  _getErrorMessage: function(errorCode) {
    var message, i;
    $.each(SWFUpload.UPLOAD_ERROR, function(i, val) {
      if (val == errorCode) {
        message = i;
        return false;
      }
    });
    message = message || "Unknown";
    
    return "Error: " + message;
  },
  
  _getProgress: function(bytesLoaded, bytesTotal) {
    var fileProgress = Math.round(bytesLoaded / bytesTotal * 100),
        fullProgress = Math.round((this._loadedSize + bytesLoaded) / this._fullSize * 100);
    
    return {
      file: fileProgress,
      full: fullProgress
    };
  },
  
  _wrap: function(text) {
    return "(" + text + ")";
  },
  
  // MAGIC! Makes all the girls lift their skirts...
  _initSwfUpload: function() {
    if (!window.SWFUpload) {
      throw new Error("SWFUpload class not loaded ...");
    }
    
    this._swfUpload = new SWFUpload({
      // SWFUpload Configuration
      // Docs: http://demo.swfupload.org/Documentation/
      upload_url:                   this._uploadUrl,
      flash_url:                    "flash/swfupload.swf",
      button_placeholder_id:        "file-upload-flash",
      file_size_limit:              "100000 MB",
      post_params:                  { "authenticity_token": this._token},
      button_width:                 110,
      button_height:                22,
      button_window_mode:           SWFUpload.WINDOW_MODE.TRANSPARENT,
      button_cursor:                SWFUpload.CURSOR.HAND,
      debug:                        false,
      file_types:                   "*.*",
      file_post_name:               "file",
      file_types_description:       "All Files",
      file_upload_limit:            100,
      file_queue_limit:             0,
      file_queued_handler:          this.__fileQueued.bind(this),
      file_dialog_complete_handler: this.__fileDialogComplete.bind(this),
      upload_start_handler:         this.__uploadStart.bind(this),
      upload_progress_handler:      this.__uploadProgress.bind(this),
      upload_success_handler:       this.__uploadSuccess.bind(this),
      upload_error_handler:         this.__uploadError.bind(this)
    });
  },
  
  // --------- SWF UPLOAD HANDLER START ---------
  __fileQueued: function(file) {
    console.log("file queue for: " + file.name);
    
    this._fullSize += file.size;
    // TODO: We need one global mechanism which renders file entries
    this._fileList.append('<li class="file disabled" id="file-' + file.id + '" tabindex="-1">' + file.name + " <span>(0 %)</span></li>");
  },
  
  __fileDialogComplete: function(numSelectedFiles) {
    console.log("-- file dialog complete --");
    
    if (numSelectedFiles == 0) { return; }
    this._numSelectedFiles = numSelectedFiles;
    
    window.onbeforeunload = function() { return "Upload is still in progress. Are you sure?"; };
    this._fileList[0].scrollTop = this._fileList[0].scrollHeight;
    this._swfUpload.startUpload();
    
  },
  
  __uploadStart: function() {
    // set path for this file
    var post_params = this._swfUpload.settings.post_params;
    post_params["file_path"] = this.parent.current_path;
    this._swfUpload.setPostParams(post_params);
  },
  
  __uploadProgress: function(file, bytesLoaded, bytesTotal) {
    console.log("upload progress for: " + file.name);
    
    var status = this._fileList.find("#file-" + file.id + " span"),
        progress = this._getProgress(bytesLoaded, bytesTotal);
    status.html(this._wrap(progress.file + " %"));
    
    document.title = this._oldTitle + " - Uploading " + progress.full + " %";
  },
  
  __uploadSuccess: function(file) {
    console.log("upload success for: " + file.name);
    
    var listElement = this._fileList.find("#file-" + file.id);
    listElement.removeClass("disabled");
    listElement.find("span").remove();
    
    this._loadedSize += file.size;
    
    this._proceed();
  },
  
  __uploadError: function(file, errorCode) {
    console.log("upload error for file: " + file.name);
    
    var listElement = this._fileList.find("#file-" + file.id),
        errorMessage = this._getErrorMessage(errorCode);
    listElement.addClass("upload-error");
    listElement.find("span").html(this._wrap(errorMessage));
    
    this._loadedSize += file.size;
    
    this._proceed();
  }
  // --------- SWF UPLOAD HANDLER END ---------
};

