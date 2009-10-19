//= require "../utils/escape_html.js"

protonet.controls.FileWidget = function() {
  this.wrapper = $("#file-list");
  this.file_list = this.wrapper.find('ul.root');
  this.hierarchy_bar = this.wrapper.find('#file-navigation .hierarchy');
  this.search_input  = this.wrapper.find('#file-navigation input');
  
  this.observeDirectories();
  this.observeBackButton();
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
  
  "observeDirectories": function() {
    var self = this;
    directories = this.wrapper.find('li.directory');
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
    $(objects).each(function(i){ html += self.createElementFor(objects[i]); });
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
  }
};
