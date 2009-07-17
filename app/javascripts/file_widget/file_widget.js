function FileWidget() {
  this.wrapper = $("#file-list");
  this.file_list = this.wrapper.find('ul.root');
  this.location_bar = this.wrapper.find('#file-navigation input');
  this.observeDirectories();
  this.observeBackButton();
  this.current_path = '';
  this.updateLocationBar();
}

FileWidget.prototype = {
  
  "gotoPath": function(path) {
    var path = path || ''
    var self = this;
    jQuery.getJSON('files', {"path": path}, function(data) {
      self.renderResponse(data);
    });
  },
  
  "observeDirectories": function() {
    var self = this;
    this.wrapper.find('li.directory').click(function(){
      self.moveDown($(this).html());
      // self.renderResponse(self.getData($(this).html()));
    });
  },
  
  "observeBackButton": function() {
    var self = this;
    this.wrapper.find("button.parent").click(function(){
      self.moveUp();  
    });
  },
  
  "renderResponse": function(objects) {
    var self = this;
    var html = '';
    $(objects).each(function(i){html += self.createElementFor(objects[i]);})
    this.file_list.html($(html));
    // now observe those directories
    this.observeDirectories();
  },
  
  "createElementFor": function(object) {
    return '<li class="' + object.type +'">' + object.name + '</li>'
  },
  
  "moveDown": function(path) {
    this.current_path += '/' + path;
    this.gotoPath(this.current_path);
    this.updateLocationBar();
  },
  
  "moveUp": function() {
    debugger;
    this.current_path.replace(/.*(\/[^\/]*)/, '');
    this.gotoPath(this.current_path);
    this.updateLocationBar();
  },
  
  "updateLocationBar": function() {
    // show slash when empty
    this.location_bar.val(this.current_path == '' ? '/' : this.current_path)
  }
   
}
