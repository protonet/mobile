//= require "../utils/escape_html.js"

protonet.controls.FileWidget = function() {
  this.wrapper = $("#file-list");
  this.file_list        = this.wrapper.find('ul.root');
  this.hierarchy_bar    = this.wrapper.find('#file-navigation .hierarchy');
  this.search_input     = this.wrapper.find('#file-navigation input');
  // get channel id upon instantiation
  this.currentChannelId = protonet.globals.channelSelector.getCurrentChannelId();
  
  this.observeBackButton();
  this.observeFolderCreateButton();
  this.current_path = '';
  this.addPathBlob('');
  this.initUpload();
  this.initContextMenu();
  $(protonet.globals.notifications).bind("channel.changed", function(e, id) {
    this.currentChannelId = id;
    this.current_path = "";
    this.removeDirectoriesAboveCurrent(1);
    this.gotoPath();
  }.bind(this));
};

protonet.controls.FileWidget.prototype = {
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
  
  "gotoPath": function(path) {
    path = path || '';
    this.file_list.fadeTo(100, 0.2);
    jQuery.getJSON('system/files', {"path": this.channelizePath(path)}, this.renderResponse.bind(this));
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
          title: objectName
        });
    
    anchor.appendTo(li);
    
    if (object.id) {
      li.attr("id", object.id);
    }
    
    return li;
  },
  
  "moveDown": function(path) {
    this.current_path += "/" + path;
    this.gotoPath(this.current_path);
    this.addPathBlob(path);
  },
  
  "moveUp": function() {
    // you can't move higher than root
    if(this.current_path != '') {
      this.current_path = this.removeDeepestDirectory(this.current_path);
      this.gotoPath(this.current_path);
      this.removePathBlob();
    }
  },
  
  "addPathBlob": function(blob) {
    var path = this.current_path,
        old_index = this.hierarchy_bar.children().size() + 1, // we'll be adding one a the end of this method
        blobHtml = protonet.utils.escapeHtml(blob + '/'),
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
      this.current_path = this.removeDeepestDirectory(this.current_path);
      new_index--;
    }
  },
  
  "removePathBlob": function() {
    this.hierarchy_bar.find('a:last').remove();
  },
  
  "removeDeepestDirectory": function(directory_string) {
    return directory_string.replace(/(\/[^\/]*)$/g,'');
  },
  
  "observeFolderCreateButton": function() {
    $('#new-folder-button').click(function(event){
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
            file_path:          this.channelizePath(this.current_path),
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
            link.unbind("click", stop).html(new_folder_input.val());
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
    return this.channelizePath(this.current_path) + '/' + fileName;
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
    fileNames = $.isArray(fileNames) ? fileNames : [fileNames];
    
    var message = "Published the following file(s): \n";
    message += $.map(fileNames, function(fileName) {
      return "  - file:" + this.getDownloadPathFor(fileName);
    }.bind(this)).join("\n");
    
    protonet.globals.communicationConsole.sendTweetFromMessage(message);
  }
};

//= require "file_widget/file_upload.js"
//= require "file_widget/file_context_menu.js"
//= require "file_widget/folder_context_menu.js"