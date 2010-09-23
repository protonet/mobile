//= require "../utils/escape_html.js"
//= require "../utils/parse_url.js"
//= require "../ui/resizer.js"
//= require "../lib/jquery-ui-1.8.4.highlight-effect.min.js"

protonet.controls.FileWidget = function() {
  this.container = $("#file-widget");
  this.list = this.container.find("ul");
  this.resizer = this.container.find(".resize");
  this.addressBar = this.container.find(".address-bar");
  
  new protonet.ui.Resizer(this.list, this.resizer, { storageKey: "file_widget_height" });
  
  this._observe();
};


protonet.controls.FileWidget.prototype = {
  _observe: function() {
    protonet.Notifications.bind("channel.change", function(event, channelId) {
      protonet.Notifications.trigger("files.load", channelId);
    });
    
    protonet.Notifications.bind("files.load", function(event, channelId, path) {
      this.load(channelId, path);
    }.bind(this));
    
    this.container.delegate("[data-directory-name]", "click", function(event) {
      var directoryName = $(event.currentTarget).attr("data-directory-name");
      protonet.Notifications.trigger("files.load", [this.channelId, directoryName]);
      event.preventDefault();
    }.bind(this));
  },
  
  load: function(channelId, path) {
    path = path || "/";
    
    if (!path.startsWith("/")) {
      path = (this.path || "") + path;
    }
    
    if (!path.endsWith("/")) {
      path += "/";
    }
    
    $.getJSON("system/files", {
      path:       "/" + channelId + path,
      channel_id: channelId
    }, this.render.bind(this, channelId, path));
  },
  
  render: function(channelId, path, data) {
    this.channelId = channelId;
    this.path = path;
    this.data = data;
    
    this.list.children().detach();
    
    $.each($.makeArray(data.directory), function(i, name) {
      this.renderDirectory(name);
    }.bind(this));
    
    $.each($.makeArray(data.file), function(i, name) {
      this.renderFile(name);
    }.bind(this));
    
    this._toggleAddressBar();
  },
  
  renderFile: function(name) {
    $("<li />", {
      text:                  name,
      "data-file-name":      name,
      tabIndex:              -1,
      title:                 name,
      className:             "file"
    }).appendTo(this.list);
  },
  
  renderDirectory: function(name) {
    $("<li />", {
      text:                  name,
      "data-directory-name": name,
      tabIndex:              -1,
      title:                 name,
      className:             "directory"
    }).appendTo(this.list);
  },
  
  _toggleAddressBar: function() {
    var visible = this.addressBar.is(":visible"),
        paths   = "/",
        rootLink = $("<a />", {
          href:                   "#",
          "data-directory-name":  "/",
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
        "data-directory-name":  paths,
        text:                   path
      });
      
      this.addressBar.append(pathLink).append("/");
    }.bind(this));
    
    if (this.path.length > 1 && !visible) {
      this.addressBar.slideDown("fast");
    } else if (this.path.length <= 1 && visible) {
      this.addressBar.slideUp("fast");
    }
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