function FileWidget() {
  this._object = $("#file-list");
  this.observeDirectories();
}

FileWidget.prototype = {
  
  "getData": function(path) {
    var path = path || ''
    var self = this;
    jQuery.getJSON('files', {"path": path}, function(data) {
      self.data = data;
      console.log(self.data);      
    });
  },
  
  "observeDirectories": function() {
    var self = this;
    this._object.find('li.directory').click(function(){
      self.getData($(this).html());
    });
  },
  
  "renderResponse": function() {
    
  }
   
}
