//= require "../../lib/swfupload.js"
//= require "../../user/browser.js"

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
  
  if (protonet.user.Browser.SUPPORTS_HTML5_MULTIPLE_FILE_UPLOAD()) {
    this._initHtml5Upload();
  } else if (protonet.user.Browser.SUPPORTS_FLASH_UPLOAD()) {
    this._initSwfUpload();
  } else {
    // Fallback
    this._initLegacyUpload();
  }
};

protonet.controls.FileWidget.prototype.FileUpload.prototype = {
  _initElements: function() {
    this._fileList = $("#file-list .root");
    this._form = $("#file-stash");
    this._uploadControls = $("#upload-controls");
  },
  
  _initForm: function() {
    this._uploadUrl = this._form.attr("action");
    this._token = this._form.find("[name='authenticity_token']").val();
  },
  
  _initTitle: function() {
    this._oldTitle = document.title || "";
  },
  
  _reset: function() {
    this._lastProgressFlush = 0;
    this._loadedSize = 0;
    this._fullSize = 0;
    this._numSelectedFiles = 0;
    window.onbeforeunload = null;
    document.title = this._oldTitle;
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
  
  _getUploadUrl: function() {
    return this._uploadUrl +
      "?_rails_dashboard_session=" + protonet.config.session_id +
      "&authenticity_token=" + encodeURIComponent(this._token) +
      "&file_path=" + encodeURIComponent(this.parent.current_path);
  },
  
  
  // =========================================================================================
  // ================= HTML5 MAGIC! Makes all the girls lift their skirts... =================
  // =========================================================================================
  _initHtml5Upload: function() {
    this._input = $('<input type="file" multiple="true" name="files[]" />');
    this._input.change(function() {
      this.__html5_upload(this._input[0].files);
    }.bind(this));
    
    this._uploadControls.append(this._input);
    
    if (protonet.user.Browser.SUPPORTS_HTML5_DRAG_AND_DROP()) {
      this._initHtml5DragDrop();
    }
  },
  
  _initHtml5DragDrop: function() {
    this._fileList.bind("dragenter", this.__html5_dragEnter.bind(this));
  },
  
  
  
  // --------- HTML5 UPLOAD HANDLER START ---------
  __html5_dragEnter: function() {
    console.log("drag enter ...");
    
    this._dragInput = $('<input type="file" multiple="true" name="files[]" />');
    this._dragInput.css({
      height: this._fileList.height(),
      width: this._fileList.width()
    });
    this._dragInput.bind("dragleave", this.__html5_dragLeave.bind(this));
    this._fileList.before(this._dragInput);
    this._fileList.addClass("highlight");
    this._dragInput.change(this.__html5_dropped.bind(this));
  },
  
  __html5_dragLeave: function() {
    console.log("drag leave ...");
    
    this._dragInput.remove();
    this._fileList.removeClass("highlight");
  },
  
  __html5_dropped: function() {
    console.log("files dropped ...");
    
    this.__html5_upload(this._dragInput[0].files);
    this.__html5_dragLeave();
  },
  
  __html5_upload: function(files) {
    if (!files) {
      throw new Error("FileUpload: File array not passed");
    }
    
    this._files = files;
    this._currentFileIndex = 0;
    
    // Queue files and extend
    // Caution: Don't use any lib's "each" helper here
    for (var i=0, fileLength=this._files.length; i<fileLength; i++) {
      this.__html5_fileQueued(this._files[i]);
    }
    
    // Dialog complete
    this.__html5_fileDialogComplete();
    
    // Start upload
    this.__html5_uploadFile();
  },
  
  __html5_uploadFile: function() {
    this._currentFile = this._files[this._currentFileIndex++];
    
    this._html5Upload = new XMLHttpRequest();
    this.__html5_setHandler(this._html5Upload);
    
    this._html5Upload.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    this._html5Upload.setRequestHeader("X-File-Name", this._currentFile.fileName);
    this._html5Upload.setRequestHeader("X-File-Size", this._currentFile.fileSize);
    this._html5Upload.setRequestHeader("Content-Type", "multipart/form-data");
    
    this._html5Upload.open("post", this._getUploadUrl(), true);
    this._html5Upload.send(this._currentFile);
    
    // Firefox' and W3C's way,
    // ...unfortunately it transfers files through memory!
    // this._html5Upload.overrideMimeType("text/plain; charset=x-user-defined-binary");
    // this._html5Upload.sendAsBinary(this._currentFile.getAsBinary());
  },
  
  __html5_setHandler: function() {
    var uploadObj = this._html5Upload.upload;
    uploadObj.onprogress = this.__html5_uploadProgress.bind(this);
    uploadObj.onload = this.__html5_uploadSuccess.bind(this);
    
    // TODO: Build error handling
    //uploadObj.onerror = this.__html5_uploadError.bind(this);
  },
  
  __html5_fileQueued: function(file) {
    this.__fileQueued(file.asObject());
  },
  
  __html5_fileDialogComplete: function() {
    var numSelectedFiles = this._files.length;
    if (numSelectedFiles == 0) { return; }
    
    this.__fileDialogComplete(numSelectedFiles);
  },
  
  __html5_uploadProgress: function(event) {
    this.__uploadProgress(this._currentFile.asObject(), event.loaded, event.total);
  },
  
  __html5_uploadSuccess: function(event) {
    this.__uploadSuccess(this._currentFile.asObject());
    
    this.__html5_proceed();
  },
  
  __html5_proceed: function() {
    if (--this._numSelectedFiles > 0) {
      this.__html5_uploadFile();
    } else {
      console.log("--------------");
      this.__uploadCompleted();
    }
  },
  // --------- HTML5 UPLOAD HANDLER END ---------
  
  
  
  
  // =========================================================================================
  // ================= FLASH MAGIC! Makes all the girls lift their skirts... =================
  // =========================================================================================
  _initSwfUpload: function() {
    if (!window.SWFUpload) {
      throw new Error("SWFUpload class not loaded ...");
    }
    
    var placeHolder = $('<div id="file-upload-flash" />');
    this._form.prepend(placeHolder);
    
    this._swfUpload = new SWFUpload({
      // SWFUpload Configuration
      // Docs: http://demo.swfupload.org/Documentation/
      upload_url:                   this._getUploadUrl(),
      flash_url:                    "flash/swfupload.swf",
      button_placeholder_id:        placeHolder.attr("id"),
      file_size_limit:              "100000 MB",
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
      file_queued_handler:          this.__swfUpload_fileQueued.bind(this),
      file_dialog_complete_handler: this.__swfUpload_fileDialogComplete.bind(this),
      upload_start_handler:         this.__swfUpload_uploadStart.bind(this),
      upload_progress_handler:      this.__swfUpload_uploadProgress.bind(this),
      upload_success_handler:       this.__swfUpload_uploadSuccess.bind(this),
      upload_error_handler:         this.__swfUpload_uploadError.bind(this)
    });
  },
  
  
  // --------- SWF UPLOAD HANDLER START ---------
  __swfUpload_fileQueued: function(file) {
    this.__fileQueued(file);
  },
  
  __swfUpload_fileDialogComplete: function(numSelectedFiles) {
    if (numSelectedFiles == 0) { return; }
    
    this.__fileDialogComplete(numSelectedFiles);
    
    // Start upload immediately after user has chosen files
    this._swfUpload.startUpload();
  },
  
  __swfUpload_uploadStart: function() {
    // reset path for this file, needed since moving within dirs is ajax
    this._swfUpload.setUploadURL(this._getUploadUrl());
  },
  
  __swfUpload_uploadProgress: function(file, bytesLoaded, bytesTotal) {
    this.__uploadProgress(file, bytesLoaded, bytesTotal);
  },
  
  __swfUpload_uploadSuccess: function(file) {
    this.__uploadSuccess(file);
    
    this.__swfUpload_proceed();
  },
  
  __swfUpload_uploadError: function(file, errorCode) {
    var errorMessage = this.__swfUpload_getErrorMessage(errorCode);
    this.__uploadError(file, errorMessage);
    
    this.__swfUpload_proceed();
  },
  
  __swfUpload_proceed: function() {
    if (--this._numSelectedFiles > 0) {
      this._swfUpload.startUpload();
    } else {
      this.__uploadCompleted();
    }
  },
  
  __swfUpload_getErrorMessage: function(errorCode) {
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
  // --------- SWF UPLOAD HANDLER END ---------
  
  
  
  
  // =========================================================================================
  // ==================== OLD HTML MAGIC! Makes no girl lift her skirt... ====================
  // =========================================================================================
  _initLegacyUpload: function() {
    this._input = $('<input type="file" name="file" />');
    this._uploadControls.append(this._input);
    
    this._input.change(this.__legacy_fileDialogComplete.bind(this));
  },
  
  
  // --------- LEGACY UPLOAD HANDLER START ---------
  __legacy_fileDialogComplete: function() {
    var fileName = this._input.val();
    this._currentFile = {
      id: new Date().getTime(),
      name: fileName,
      size: 0
    };
    
    this._iframe = $('<iframe src="about:blank" class="invisible-iframe" name="invisible-iframe" />');
    this._inputFilename = $('<input type="hidden" name="Filename" value="' + fileName + '" />');
    this._form.append(this._iframe);
    this._form.append(this._inputFilename);
    this._iframe.load(this.__legacy_uploadSuccess.bind(this));
    this._form.attr({
      target: "invisible-iframe",
      action: this._getUploadUrl()
    });
    
    this.__fileQueued(this._currentFile);
    this.__fileDialogComplete(this._currentFile);
    this._form.submit();
  },
  
  __legacy_uploadSuccess: function() {
    // setTimeout is necessary to avoid loading spinner bug in Firefox
    setTimeout(function() {
      this._inputFilename.remove();
      this._iframe.remove();
    }.bind(this), 100);
    
    this.__uploadSuccess(this._currentFile);
    this.__uploadCompleted();
  },
  // --------- LEGACY UPLOAD HANDLER END ---------
  
  
  
  
  // --------- GENERIC UPLOAD HANDLER START ---------
  __fileDialogComplete: function(numSelectedFiles) {
    console.log("file dialog complete ...");
    
    this._numSelectedFiles = numSelectedFiles;
    
    window.onbeforeunload = function() { return "Upload is still in progress. Are you sure?"; };
    this._fileList[0].scrollTop = this._fileList[0].scrollHeight;
  },
  
  __fileQueued: function(file) {
    console.log("file queue for: " + file.name + " (id: " + file.id + ")");
    
    this._fullSize += file.size;
    
    // TODO: We need one global mechanism which renders file entries
    this._fileList.append('<li class="file disabled" id="file-' + file.id + '" tabindex="-1">' + file.name + "<span>(0 %)</span></li>");
  },
  
  __uploadProgress: function(file, bytesLoaded, bytesTotal) {
    // Ensure that this method is called only once every 100 milliseconds, otherwise safari gets slow
    if ((new Date() - this._lastProgressFlush) < 100) {
      return;
    }
    
    console.log("upload progress for: " + file.name + " (id: " + file.id + ")");
    this._lastProgressFlush = new Date();
    var status = this._fileList.find("#file-" + file.id + " span"),
        progress = this._getProgress(bytesLoaded, bytesTotal);
    status.html(this._wrap(progress.file + " %"));
    
    document.title = this._oldTitle + " - Uploading " + progress.full + " %";
  },
  
  __uploadError: function(file, errorMessage) {
    console.log("upload error for: " + file.name + " (id: " + file.id + ")");
    
    var listElement = this._fileList.find("#file-" + file.id);
    listElement.addClass("upload-error");
    listElement.find("span").html(this._wrap(errorMessage));
    
    this._loadedSize += file.size;
  },
  
  __uploadSuccess: function(file) {
    console.log("upload success for: " + file.name + " (id: " + file.id + ")");
    
    var listElement = this._fileList.find("#file-" + file.id);
    listElement.removeClass("disabled");
    listElement.find("span").remove();
    
    this._loadedSize += file.size;
  },
  
  __uploadCompleted: function() {
    console.log("upload finished ...");
    
    // All files are uploaded
    this._reset();
    this.parent.initContextMenu();
  }
  // --------- GENERIC UPLOAD HANDLER END ---------
};

