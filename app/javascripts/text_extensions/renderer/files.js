protonet.text_extensions.render.files = function(data) {
  var $ul = $("<ul>", { "class": "files" });
  
  $.each(data.files, function(i, file) {
    var $li = $("<li>").appendTo($ul);
    
    $("<a>", {
      href:       protonet.data.File.getUrl(file),
      text:       protonet.data.File.getName(file),
      "class":    protonet.data.File.isFolder(file) ? "folder" : "file",
      draggable:  "true"
    }).appendTo($li);
  });
  
  return $ul;
};