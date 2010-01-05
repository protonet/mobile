//= require "../utils/escape_html.js"

protonet.controls.FileWidget = function(communicationConsole) {
  this.communicationConsole = communicationConsole;
  
  this.wrapper = $("#file-list");
  this.file_list = this.wrapper.find('ul.root');
  this.hierarchy_bar = this.wrapper.find('#file-navigation .hierarchy');
  this.search_input  = this.wrapper.find('#file-navigation input');
  
  this.observeDirectories();
  this.observeBackButton();
  this.observeFolderCreateButton();
  this.current_path = '';
  this.addPathBlob('');
  this.initUpload();
  this.initContextMenu();
};

protonet.controls.FileWidget.prototype = {
  "initUpload": function() {
    new this.FileUpload(this);
  },
  
  "initContextMenu": function() {
    new this.FileContextMenu(this);
  },
  
  "gotoPath": function(path) {
    path = path || '';
    var self = this;
    this.file_list.fadeTo(100, 0.2);
    jQuery.getJSON('system/files', {"path": path}, function(data) {
      self.renderResponse(data);
    });
  },
  
  "observeDirectories": function(directories) {
    var self = this;
    directories || (directories = this.wrapper.find('li.directory'));
    if(directories.length != 0) {
      directories.click(function(event){
        event.preventDefault();
        self.moveDown($(this).html());
      });      
    }
  },
  
  "observeBackButton": function() {
    var self = this;
    this.wrapper.find("button.parent").click(function(event){
      self.moveUp();
      event.stopPropagation();
      return false;
    });
  },
  
  "renderResponse": function(objects) {
    var self = this;
    var html = '';
    $(objects).each(function(i){
      $(objects[i].name).each(function(j) {
        html += self.createElementFor({"type": objects[i].type, "name": objects[i].name[j]}); 
      });
    });
    this.file_list[0].scrollTop = 0;
    this.file_list.html(html ? $(html) : '').stop().fadeTo(200, 1);
    // now observe those directories
    this.observeDirectories();
    this.initContextMenu(this);
  },
  
  "createElementFor": function(object) {
    return '<li class="' + object.type +'" tabindex="-1">' + object.name + '</li>';
  },
  
  "moveDown": function(path) {
    this.current_path += '/' + path;
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
    var self = this;
    var path = this.current_path;
    var old_index = this.hierarchy_bar.children().size() + 1; // we'll be adding one a the end of this method
    var blobHtml = protonet.utils.escapeHtml(blob + '/');
    var blobTitle = protonet.utils.escapeHtml('Go to folder "' + (blob || "/") + '"');
    object_to_add = $('<a href="#" title="' + blobTitle + '">' + blobHtml + '</a>');
    object_to_add.click(function(event){
      event.preventDefault(); 
      self.gotoPath(path);
      var new_index = self.hierarchy_bar.children().size();
      while(new_index > old_index) {
        self.removePathBlob();
        self.current_path = self.removeDeepestDirectory(self.current_path);
        new_index--;
      }
    });
    this.hierarchy_bar.append(object_to_add);
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
    var create_folder_url = "system/files/create_directory";
    var new_folder = $(this.createElementFor({"type": "directory", "name": ""}));
    var new_folder_form = $('<form action="' + create_folder_url +'"></form>');
    var new_folder_input = $('<input name="directory_name" type="text" style="width:247px; display: block; height: 17px;"/>');

    new_folder.append(new_folder_form);    
    new_folder_form.append(new_folder_input);
    new_folder_form.append($('<input name="file_path" type="hidden" value="' + this.current_path + '"/>'));
    new_folder_form.append($('<input name="authenticity_token" type="hidden" value="' + protonet.config.authenticity_token + '"/>'));
    
    new_folder_form.submit(function(event){
      event.preventDefault();
      $.post(create_folder_url, new_folder_form.serialize(), function() {
        new_folder.html(new_folder_input.val());
        this.observeDirectories(new_folder);
      }.bind(this));
    }.bind(this));
    
    this.file_list.append(new_folder);
    
    new_folder_input.focus();
  },
  
  "getFilePathFor": function(fileName) {
    return this.current_path + '/' + fileName;
  },
  
  "getDownloadPathFor": function(fileName) {
    var filePath = this.getFilePathFor(fileName);
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
    
    this.communicationConsole.sendTweetFromMessage(message);
  }
};

//= require "file_widget/file_upload.js"
//= require "file_widget/file_context_menu.js"