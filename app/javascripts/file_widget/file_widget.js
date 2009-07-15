function FileWidget() {
  this._object = $("file-list");
  this.getData();
}

FileWidget.prototype = {
  
  "getData": function(path) {
    var path = path || ''
    var self = this;
    jQuery.getJSON('files', {"path": path}, function(data) {
      self.data = data;
      console.log(self.data);      
    });
  }
  
}
