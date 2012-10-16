protonet.text_extensions.render.files = function(data) {
  var imageHrefs  = [],
      imageSrcs   = [],
      imageTitles = [];
  
  $.each(data.files, function(i, path) {
    if (protonet.File.isImage(path)) {
      imageHrefs.push(protonet.File.getUrl(path));
      imageSrcs.push(protonet.File.getDownloadUrl(path));
      imageTitles.push(protonet.File.getName(path));
    }
  });
  
  if (imageSrcs.length === data.files.length) {
    if (imageSrcs.length === 1) {
      $.extend(data, {
        image:        imageSrcs[0],
        imageHref:    imageHrefs[0],
        imageTitle:   imageTitles[0],
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
        rel:        "external",
        target:     "_blank",
        href:       protonet.File.getUrl(file),
        text:       protonet.File.getName(file),
        "class":    protonet.File.isFolder(file) ? "folder" : "file"
      }).appendTo($li);
    });

    return $ul;
  }
};