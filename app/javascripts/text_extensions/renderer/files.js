protonet.text_extensions.render.files = function(data) {
  var imageHrefs  = [],
      imageSrcs   = [],
      imageTitles = [];
  
  $.each(data.files, function(i, path) {
    if (protonet.data.File.isImage(path)) {
      imageHrefs.push(protonet.data.File.getUrl(path));
      imageSrcs.push(protonet.data.File.getDownloadUrl(path));
      imageTitles.push(protonet.data.File.getName(path));
    }
  });
  
  if (imageSrcs.length === data.files.length) {
    if (imageSrcs.length === 1) {
      $.extend(data, {
        image:        imageSrcs[0],
        imageHref:    imageHrefs[0],
        imageTitle:   imageTitles[0],
        title:        imageTitles[0],
        _newType:     "image"
      });
      return protonet.text_extensions.render.image(data);
    } else {
      $.extend(data, {
        image:        imageSrcs,
        imageHref:    imageHrefs,
        imageTitle:   imageTitles,
        _newType:     "images"
      });
      return protonet.text_extensions.render.images(data);
    }
  } else {
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
  }
};