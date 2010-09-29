//= require "../utils/escape_html.js"
//= require "../utils/parse_url.js"
//= require "../ui/resizer.js"
//= require "../lib/jquery-ui-1.8.4.highlight-effect.min.js"

protonet.controls.FileWidget = function() {
  this.container      = $("#file-widget");
  this.list           = this.container.find("ul");
  this.resizer        = this.container.find(".resize");
  this.navBar         = this.container.find(".nav-bar");
  this.addressBar     = this.container.find(".address-bar");
  
  this.forwardButton  = this.navBar.find("[rel=forward]");
  this.backwardButton = this.navBar.find("[rel=backward]");
  
  new protonet.ui.Resizer(this.list, this.resizer, { storageKey: "file_widget_height" });
  
  this._resetHistory();
  this._createContextMenu();
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
      
      .bind("directory.removed", function(event, data) {
        if (data.channel_id != this.channelId) {
          return;
        }
        this.list.find("[data-directory-path='" + data.path + "']").detach();
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
      }.bind(this));
  },
  
  _createContextMenu: function() {
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
            protonet.ui.FlashMessage.show("error", protonet.t("FILE_DELETE_ERROR"));
          }
        });
        
        closeContextMenu();
      }.bind(this)
    });
    
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
            protonet.ui.FlashMessage.show("error", protonet.t("DIRECTORY_DELETE_ERROR"));
          }
        });
        
        closeContextMenu();
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
    
    $.each($.makeArray(data.directory), function(i, name) {
      this.renderItem("directory", name);
    }.bind(this));
    
    $.each($.makeArray(data.file), function(i, name) {
      this.renderItem("file", name);
    }.bind(this));
    
    if (!fromHistory) {
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(this.path);
      this.historyIndex = this.history.length - 1;
    }
    
    this._toggleNavBar();
  },
  
  renderItem: function(type, name) {
    var path = this.path + name;
    
    $("<li />", {
      title:      name,
      className:  type
    }).attr("data-" + type + "-path", path).append(
      $("<a />", {
        tabIndex:   -1,
        href:       this.getDownloadPath("/" + this.channelId + path),
        text:       name,
        target:     "_blank"
      })
    ).appendTo(this.list);
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
      
      messageText.push("  * file:" + downloadUrl);
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


protonet.controls.FileWidget2 = function() {
  this.wrapper          = $("#file-list");
  this.file_list        = this.wrapper.find("ul.root");
  this.hierarchy_bar    = this.wrapper.find("#file-navigation .hierarchy");
  
  // get channel id upon instantiation
  this.currentChannelId = protonet.timeline.Channels.selected;
  
  this.observeBackButton();
  this.observeFolderCreateButton();
  this.currentPath = "";
  this.addPathBlob("");
  this.initUpload();
  this.initContextMenu();
  
  protonet.Notifications.bind("channel.change", function(e, id) {
    this.currentChannelId = id;
    this.currentPath = "";
    this.removeDirectoriesAboveCurrent(1);
    this.gotoPath();
  }.bind(this));
  
  protonet.Notifications.bind("file.added file.removed directory.added directory.removed", function(e, msg){
    if (msg.path == this.fullPath()) {
      switch(e.type + "." + e.handleObj.namespace) {
        case "file.added":
          if(!this.wrapper.find(".file a[title='" + msg.file_name + "']")[0]) {
            this.file_list.append(this.createElementFor({ type: "file", name: msg.file_name }));
          }
          break;
        case "file.removed":
          this.wrapper.find(".file a[title='" + msg.file_name + "']").remove();
          break;
        case "directory.added":
          if(!this.wrapper.find(".directory a[title='" + msg.directory_name + "']")[0]) {
            this.file_list.append(this.createElementFor({ type: "directory", name: msg.directory_name }));
          }
          break;
        case "directory.removed":
          this.wrapper.find(".directory a[title='" + msg.directory_name + "']").remove();
          break;
      }
    };
  }.bind(this));
};

protonet.controls.FileWidget2.prototype = {
  "initUpload": function() {
    new this.FileUpload(this);
  },
  
  "initContextMenu": function() {
    if (this._fileContextMenu) {
      this._fileContextMenu.update();
    } else {
      this._fileContextMenu = new this.FileContextMenu(this);
    }
    
    if (this._folderContextMenu) {
      this._folderContextMenu.update();
    } else {
      this._folderContextMenu = new this.FolderContextMenu(this);
    }
  },
  
  "channelizePath": function(path) {
    return '/' + this.currentChannelId + path;
  },
  
  "fullPath": function() {
    return this.channelizePath(this.currentPath);
  },
  
  "gotoPath": function(path) {
    path = path || '';
    this.file_list.fadeTo(100, 0.2);
    jQuery.getJSON("system/files", {"path": this.channelizePath(path), "channel_id": this.currentChannelId}, this.renderResponse.bind(this));
  },
  
  "observeBackButton": function() {
    this.wrapper.find("button.parent").click(function(event){
      this.moveUp();
      event.preventDefault();
    }.bind(this));
  },
  
  "renderResponse": function(objects) {
    this.file_list.html("");
    $(objects).each(function(i, object){
      $(object.name).each(function(j, fileName) {
        this.file_list.append(this.createElementFor({"type": objects[i].type, "name": fileName}));
      }.bind(this));
    }.bind(this));
    
    this.file_list.attr("scrollTop", 0).stop().fadeTo(200, 1);
    
    // now observe those directories
    this.initContextMenu(this);
  },
  
  "createElementFor": function(object) {
    var objectName = protonet.utils.escapeHtml(object.name),
        li = $("<li />", { className: object.type, tabindex: "-1" }),
        anchor = $("<a />", {
          href: this.getDownloadPathFor(object.name),
          html: objectName,
          title: objectName,
          target: '_blank'
        });
    
    anchor.appendTo(li);
    
    if (object.id) {
      li.attr("id", object.id);
    }
    
    return li;
  },
  
  "moveDown": function(path) {
    this.currentPath += "/" + path;
    this.gotoPath(this.currentPath);
    this.addPathBlob(path);
  },
  
  "moveUp": function() {
    // you can't move higher than root
    if(this.currentPath != '') {
      this.currentPath = this.removeDeepestDirectory(this.currentPath);
      this.gotoPath(this.currentPath);
      this.removePathBlob();
    }
  },
  
  "addPathBlob": function(blob) {
    var path = this.currentPath,
        old_index = this.hierarchy_bar.children().size() + 1, // we'll be adding one a the end of this method
        blobHtml = protonet.utils.escapeHtml(blob + "/"),
        blobTitle = protonet.utils.escapeHtml('Go to folder "' + (blob || "/") + '"');
    object_to_add = $('<a />', { href: "#", title: blobTitle, html: blobHtml });
    object_to_add.click(function(event){
      event.preventDefault(); 
      this.gotoPath(path);
      this.removeDirectoriesAboveCurrent(old_index);
    }.bind(this));
    this.hierarchy_bar.append(object_to_add);
  },
  
  "removeDirectoriesAboveCurrent": function(old_index) {
    var new_index = this.hierarchy_bar.children().size();
    while(new_index > old_index) {
      this.removePathBlob();
      this.currentPath = this.removeDeepestDirectory(this.currentPath);
      new_index--;
    }
  },
  
  "removePathBlob": function() {
    this.hierarchy_bar.find("a:last").remove();
  },
  
  "removeDeepestDirectory": function(directory_string) {
    return directory_string.replace(/(\/[^\/]*)$/g,'');
  },
  
  "observeFolderCreateButton": function() {
    $("#new-folder-button").click(function(event){
      this.addFolder();
      event.preventDefault();
    }.bind(this));
  },
  
  "addFolder": function() {
    var create_folder_url = "system/files/create_directory",
        new_folder = this.createElementFor({ type: "directory", name: ""}),
        new_folder_input = $("<input />"),
        stop = function(event) { event.preventDefault(); event.stopPropagation(); },
        link = new_folder.find("a").html(new_folder_input).bind("click", stop);
    
    new_folder_input.bind("keydown", function(event) {
      if (event.keyCode == "27") {
        event.preventDefault();
        new_folder_input.unbind("keydown");
        new_folder.remove();
      }
    });
    
    new_folder_input.bind("keydown", function(event) {
      if (event.keyCode == 13) {
        event.preventDefault();
        
        if (!$.trim(new_folder_input.val())) {
          return;
        }
        $.ajax({
          type: "POST",
          url: create_folder_url,
          data: {
            directory_name:     new_folder_input.val(),
            file_path:          this.fullPath(),
            channel_id:         this.currentChannelId,
            authenticity_token: protonet.config.authenticity_token
          },
          beforeSend: function() {
            new_folder_input.attr("disabled", true);
          },
          complete: function() {
            new_folder_input.attr("disabled", false);
          },
          success: function() {
            new_folder_input.unbind("keydown");
            var folder_name = new_folder_input.val();
            link.unbind("click", stop).html(folder_name).attr("title", folder_name);
            this.initContextMenu();
          }.bind(this),
          error: function(transport) {
            if (transport.status == "409") {
              alert("Folder already exists. Please choose a different name.");
              new_folder_input[0].select();
            }
          }
        });
      }
    }.bind(this));
    
    var lastDirectory = this.file_list.find("li.directory:last");
    lastDirectory.length ? lastDirectory.after(new_folder) : this.file_list.append(new_folder);
    
    new_folder_input.focus();
  },
  
  "getFilePathFor": function(fileName) {
    return this.channelizePath(this.currentPath) + '/' + fileName;
  },
  
  "getDownloadPathFor": function(fileName) {
    var filePath = this.getFilePathFor($.trim(fileName));
    return "/system/files/show?file_path=" + encodeURIComponent(filePath);
  },
  
  /**
   * Publishes one or more files to the timeline
   * Takes a single fileName or an array of fileNames as argument
   */
  "publish": function(fileNames) {
    fileNames   = $.makeArray(fileNames);
    var message     = {},
        images      = [],
        imageNames  = [],
        imageRegExp = /.+\.(jpe?g|gif|png)$/i,
        messageText = ["Published the following file(s):"];
    
    $.each(fileNames, function(i, fileName) {
      var fileUrl = this.getDownloadPathFor(fileName);
      if (imageRegExp.test(fileName)) {
        images.push(protonet.config.base_url + fileUrl);
        imageNames.push(fileName);
      }
      
      messageText.push("  - file:" + fileUrl);
    }.bind(this)).join("\n");
    
    if (images.length) {
      message.text_extension = {
        title:        "",
        image:        images,
        imageHref:    images,
        imageTitle:   imageNames
      };
      
      protonet.globals.textExtensionInput.setInput(message.text_extension);
    }
    
    message.message = messageText.join("\n");
    protonet.globals.communicationConsole.sendMessage(message);
  }
};

//= require "file_widget/file_upload.js"
//= require "file_widget/file_context_menu.js"
//= require "file_widget/folder_context_menu.js"