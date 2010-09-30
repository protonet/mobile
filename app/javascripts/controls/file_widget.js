//= require "../utils/escape_html.js"
//= require "../utils/parse_url.js"
//= require "../ui/resizer.js"
//= require "../lib/jquery-ui-1.8.4.highlight-effect.min.js"
//= require "../lib/plupload.full.min.js"

protonet.controls.FileWidget = function() {
  this.container      = $("#file-widget");
  this.list           = this.container.find("ul");
  this.resizer        = this.container.find(".resize");
  this.navBar         = this.container.find(".nav-bar");
  this.addressBar     = this.container.find(".address-bar");
  this.dropArea       = $("#drop-area");
  
  this.forwardButton  = this.navBar.find("[rel=forward]");
  this.backwardButton = this.navBar.find("[rel=backward]");
  
  new protonet.ui.Resizer(this.list, this.resizer, { storageKey: "file_widget_height" });
  
  this._resetHistory();
  this._initContextMenu();
  this._initFileUpload();
  this._observe();
};


protonet.controls.FileWidget.prototype = {
  _observe: function() {
    protonet.Notifications
      .bind("channel.change", function(event, channelId) {
        this._resetHistory();
        protonet.Notifications.trigger("files.load", channelId);
      }.bind(this))
      
      .bind("files.load", function(event, channelId, path, fromHistory) {
        this.load(channelId, path, fromHistory);
      }.bind(this))
      
      .bind("file.removed", function(event, data) {
        if (data.channel_id != this.channelId) {
          return;
        }
        this.list.find("[data-file-path='" + data.path + "']").detach();
      }.bind(this))
      
      .bind("file.added", function(event, data) {
        if (data.channel_id != this.channelId || data.path != this.path) {
          return;
        }
        this.renderItem("file", data.file_name)
          .css("backgroundColor", "#ffff99")
          .animate({ "backgroundColor": "#ffffff" }, { duration: 1000 });
      }.bind(this))
      
      .bind("directory.removed", function(event, data) {
        if (data.channel_id != this.channelId) {
          return;
        }
        this.list.find("[data-directory-path='" + data.path + "']").detach();
      }.bind(this))
      
      .bind("directory.added", function(event, data) {
        if (data.channel_id != this.channelId || data.path != this.path) {
          return;
        }
        this.renderItem("directory", data.directory_name, true)
          .css("backgroundColor", "#ffff99")
          .animate({ "backgroundColor": "#ffffff" }, { duration: 1000 });
      }.bind(this));
    
    
    this.container
      .delegate(".address-bar [data-directory-path]", "click", function(event) {
        var path = $(event.currentTarget).attr("data-directory-path");
        protonet.Notifications.trigger("files.load", [this.channelId, path]);
        event.preventDefault();
      }.bind(this))
      
      .delegate(".enabled[rel=backward]", "click", function(event) {
        protonet.Notifications.trigger("files.load", [this.channelId, this.history[--this.historyIndex], true]);
      }.bind(this))
      
      .delegate(".enabled[rel=forward]", "click", function(event) {
        protonet.Notifications.trigger("files.load", [this.channelId, this.history[++this.historyIndex], true]);
      }.bind(this))
      
      .delegate("li.disabled", "click", function(event) {
        event.stopPropagation();
        event.preventDefault();
      }.bind(this));
  },
  
  _initContextMenu: function() {
    /**
     * File context menu
     */
    new protonet.ui.ContextMenu("#file-widget ul [data-file-path]", {
      "<strong>download</strong>": function(li, closeContextMenu) {
        window.open(li.find("a").attr("href"), +new Date());
        closeContextMenu();
      },
      "publish": function(li, closeContextMenu) {
        this.publish("/" +  this.channelId + li.attr("data-file-path"));
        closeContextMenu();
      }.bind(this),
      "delete": function(li, closeContextMenu) {
        /**
         * Success response comes as event notification
         */
        $.ajax({
          url:        "system/files/delete",
          type:       "post",
          data:       {
            file_path:  li.attr("data-file-path"),
            channel_id: this.channelId
          },
          beforeSend: function() {
            li.addClass("disabled");
          },
          error: function() {
            li.removeClass("disabled");
            protonet.Notifications.trigger("flash_message.error", protonet.t("FILE_DELETE_ERROR"));
          }
        });
        
        closeContextMenu();
      }.bind(this)
    });
    
    /**
     * Folder context menu
     */
    new protonet.ui.ContextMenu("#file-widget ul [data-directory-path]", {
      "<strong>open</strong>":   function(li, closeContextMenu) {
        var path = li.attr("data-directory-path");
        protonet.Notifications.trigger("files.load", [this.channelId, path]);
        closeContextMenu();
      }.bind(this),
      "delete": function(li, closeContextMenu) {
        if (!confirm(protonet.t("DIRECTORY_DELETE_CONFIRM"))) {
          return;
        }
        
        /**
         * Success response comes as event notification
         */
        $.ajax({
          url:  "system/files/delete_directory",
          type: "post",
          data: {
            file_path:  li.attr("data-directory-path"),
            channel_id: this.channelId
          },
          beforeSend: function() {
            li.addClass("disabled");
          },
          error: function() {
            li.removeClass("disabled");
            protonet.Notifications.trigger("flash_message.error", protonet.t("DIRECTORY_DELETE_ERROR"));
          }
        });
        
        closeContextMenu();
      }.bind(this)
    });
    
    /**
     * New file/folder context menu
     */
    this.uploadContextMenu = new protonet.ui.ContextMenu("#add-objects", {
      "Create new folder": function(li, closeContextMenu) {
        this.createFolderInput();
        closeContextMenu();
      }.bind(this),
      "Upload file": function(li, closeContextMenu) {}
    });
    
    var refresh = function() {
      this.uploader.trigger("Refresh");
    }.bind(this);
    
    this.uploadContextMenu.bind("open", refresh).bind("close", refresh);
  },
  
  _initFileUpload: function() {
    /**
     * The browse link is part of the context menu which doesn't exist yet
     */
    var timestamp   = new Date().getTime(),
        list        = this.uploadContextMenu.list,
        browseLink  = list.children(":eq(1)").attr("id", "browse:" + timestamp),
        progress    = $("<span />", { className: "progress", text: "(0 %) " });
    
    this.uploader = new plupload.Uploader({
      runtimes:       "html5,flash",
      browse_button:  browseLink.attr("id"),
      container:      browseLink.attr("id"),
      max_file_size:  "1000mb",
      url:            "",
      flash_swf_url:  "/flash/plupload.flash.swf",
      drop_element:   this.dropArea.attr("id")
    });
    
    this.uploader.bind("FilesAdded", function(uploader, files) {
      $.each(files, function(i, file) {
        this.renderItem("file", file.name)
          .attr("id", "file-" + file.id)
          .addClass("disabled")
          .children("a")
          .prepend(progress.clone());
      }.bind(this));
      this.list.attr("scrollTop", this.list.attr("scrollHeight"));
      this.dropArea.trigger("dragleave");
    }.bind(this));
    
    this.uploader.bind("QueueChanged", function(uploader, files) {
      uploader.settings.url = this._getUploadUrl();
      uploader.start();
    }.bind(this));
    
    this.uploader.bind("UploadProgress", function(uploader, file) {
      this.list.find("#file-" + file.id + " .progress").text("(" + file.percent + " %) ");
    }.bind(this));
    
    this.uploader.bind("BeforeUpload", function(uploader, file) {
      window.onbeforeunload = function() {
        return protonet.t("UPLOAD_IN_PROGRESS");
      };
    });
    
    this.uploader.bind("FileUploaded", function(uploader, file) {
      window.onbeforeunload = null;
      this.list.find("#file-" + file.id).detach();
    }.bind(this));
    
    this.uploader.bind("Error", function(uploader, error) {
      window.onbeforeunload = null;
      
      protonet.Notifications.trigger(
        "flash_message.error",
        "Error: " + error.message +
        "(Code: " + error.code + ", Status " + error.status + ") ");
      
      try {
        this.list.find("#file-" + error.file.id)
          .removeClass("disabled")
          .addClass("error")
          .find(".progress")
          .text("(error) ");
      } catch(e) {};
    }.bind(this));
    
    this.dropArea
      .bind("dragover", function(event) {
        event.preventDefault();
        this.dropArea.addClass("dragenter").html(protonet.t("DROP"));
      }.bind(this))
      .bind("dragleave", function(event) {
        event.preventDefault();
        this.dropArea.removeClass("dragenter").html(this.dropArea.data("default_html"));
      }.bind(this))
      .data("default_html", this.dropArea.html());
    
    this.uploader.init();
  },
  
  _getUploadUrl: function() {
    return "/system/files" +
      "?_rails_dashboard_session=" + encodeURIComponent(protonet.user.data.session_id) +
      "&authenticity_token="       + encodeURIComponent(protonet.user.data.authenticity_token) +
      "&channel_id="               + this.channelId + 
      "&file_path="                + encodeURIComponent(this.path);
  },
  
  createFolderInput: function() {
    var li = this.renderItem("directory", "", true);
    li.children().detach();
    
    var input = $("<input />", {
      value: protonet.t("DEFAULT_DIRECTORY")
    }).appendTo(li);
    
    /** Deferred focus needed to avoid conflict with blur event */
    var deferredFocus = function() {
      setTimeout(function() { input.focus(); }, 10);
    };
    
    input.focus().get(0).select();
    
    input.bind({
      click: function(event) {
        event.stopPropagation();
      },
      keypress: function(event) {
        if (event.keyCode == 13) {
          $(this).trigger("blur");
        }
        if (event.keyCode == 27) {
          li.detach();
        }
      },
      blur: function() {
        if (!$.trim(input.val())) {
          deferredFocus();
          return;
        }
        
        $.ajax({
          type: "post",
          url:  "system/files/create_directory",
          data: {
            directory_name:     input.val(),
            file_path:          this.path,
            channel_id:         this.channelId,
            authenticity_token: protonet.user.data.authenticity_token
          },
          beforeSend: function() { input.attr("disabled", "disabled"); },
          complete:   function() { input.removeAttr("disabled"); },
          success:    function() { input.detach(); }.bind(this),
          error:      function(transport) {
            var message;
            if (transport.status == "409") {
              message = "DIRECTORY_EXISTS_ERROR";
            } else {
              message = "UNKNOWN_ERROR";
            }
            protonet.Notifications.trigger("flash_message.error", protonet.t(message));
            deferredFocus();
          }
        });
      }.bind(this)
    });
  },
  
  load: function(channelId, path, fromHistory) {
    path = path || "/";
    if (!path.startsWith("/")) {
      path = (this.path || "") + path;
    }
    
    if (!path.endsWith("/")) {
      path += "/";
    }
    
    if (path == this.path && channelId == this.channelId) {
      return;
    }
    
    $.ajax({
      url:        "system/files",
      data:       {
        path:       "/" + channelId + path,
        channel_id: channelId
      },
      dataType:   "json",
      success:    this.render.bind(this, channelId, path, fromHistory),
      beforeSend: function() {
        this.forwardButton.add(this.backwardButton).removeClass("enabled");
        this.container.addClass("loading");
      }.bind(this),
      complete:   function() {
        this.container.removeClass("loading");
      }.bind(this)
    });
  },
  
  render: function(channelId, path, fromHistory, data) {
    this.channelId = channelId;
    this.path = path;
    this.data = data;
    
    this.list.attr("scrollTop", 0).children().detach();
    
    /**
     * Chunk it for performance reasons, we never know how many files have
     * to be rendered
     */
    $.makeArray(data.directory).chunk(function(name) {
      this.renderItem("directory", name);
    }.bind(this), function() {
      $.makeArray(data.file).chunk(function(name) {
        this.renderItem("file", name);
      }.bind(this), function() {
        if (!fromHistory) {
          this.history = this.history.slice(0, this.historyIndex + 1);
          this.history.push(this.path);
          this.historyIndex = this.history.length - 1;
        }
        
        this._toggleNavBar();
      }.bind(this));
    }.bind(this));
  },
  
  renderItem: function(type, name, ensurePosition) {
    var path = this.path + name,
        position = ensurePosition && this.list.find("." + type + ":last");
    
    var li = $("<li />", {
      title:      name,
      className:  type
    }).attr("data-" + type + "-path", path).append(
      $("<a />", {
        tabIndex:   -1,
        href:       this.getDownloadPath("/" + this.channelId + path),
        text:       name,
        target:     "_blank"
      })
    );
    
    if (position && position.length) {
      li.insertAfter(position);
    } else {
      li.appendTo(this.list);
    }
    
    return li;
  },
  
  publish: function(filePaths) {
    filePaths = $.makeArray(filePaths);
    
    var message     = {},
        images      = [],
        imageNames  = [],
        imageRegExp = /.+\.(jpe?g|gif|png)$/i,
        messageText = [protonet.t("PUBLISH_FILES")];
    
    $.each(filePaths, function(i, filePath) {
      var fileName = filePath.slice(filePath.lastIndexOf("/") + 1),
          downloadUrl = this.getDownloadPath(filePath);
      if (imageRegExp.test(fileName)) {
        images.push(protonet.config.base_url + downloadUrl);
        imageNames.push(fileName);
      }
      
      messageText.push("• file:" + downloadUrl);
    }.bind(this)).join("\n");
    
    protonet.Notifications.trigger("form.custom_submit", [messageText.join("\n"), images.length ? {
      title:        "",
      image:        images,
      imageHref:    images,
      imageTitle:   imageNames
    } : ""]);
  },
  
  getDownloadPath: function(path) {
    return "/system/files/show?file_path=" + encodeURIComponent(path);
  },
  
  _toggleNavBar: function() {
    var isAddressBarVisible = this.addressBar.is(":visible"),
        paths               = "/",
        rootLink            = $("<a />", {
          href:                   "#",
          "data-directory-path":  "/",
          text:                   "/"
        });
    
    this.addressBar.html("").append(rootLink);
    
    $.each(this.path.split("/"), function(i, path) {
      if (!path) {
        return;
      }
      
      paths += path + "/";
      
      var pathLink = $("<a />", {
        href:                   "#",
        "data-directory-path":  paths,
        text:                   path
      });
      
      this.addressBar.append(pathLink).append("<span>/</span>");
    }.bind(this));
    
    if (this._navBarShouldBeShown()) {
      this.navBar.stop().filter(":not(:visible)").slideDown("fast");
    } else {
      this.navBar.stop().filter(":visible").slideUp("fast");
    }
    
    if (this._forwardButtonShouldBeEnabled()) {
      this.forwardButton.addClass("enabled");
    }
    
    if (this._backwardButtonShouldBeEnabled()) {
      this.backwardButton.addClass("enabled");
    }
  },
  
  _resetHistory: function() {
    this.history = [];
    this.historyIndex = 0;
  },
  
  _navBarShouldBeShown: function() {
    return (this.path.length > 1 || this.history.length > 1);
  },
  
  _forwardButtonShouldBeEnabled: function() {
    return this.historyIndex < (this.history.length - 1);
  },
  
  _backwardButtonShouldBeEnabled: function() {
    return this.historyIndex > 0;
  }
};