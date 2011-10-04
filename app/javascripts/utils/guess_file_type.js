protonet.utils.guessFileType = (function() {
  var mapping = {
    "jpg":      "image",
    "jpeg":     "image",
    "gif":      "image",
    "bmp":      "image",
    "png":      "image",
    "svg":      "image",
    "ico":      "image",
    "html":     "html",
    "htm":      "html",
    "txt":      "text",
    "mp3":      "audio",
    "ogg":      "audio",
    "wma":      "audio",
    "asx":      "audio",
    "asf":      "audio",
    "wav":      "audio",
    "mpg":      "video",
    "m4v":      "video",
    "mpeg":     "video",
    "wmv":      "video",
    "avi":      "video",
    "swf":      "flash",
    "pdf":      "document",
    "doc":      "document",
    "docx":     "document",
    "xls":      "document",
    "xlsx":     "document",
    "ppt":      "document",
    "pptx":     "document",
    "dmg":      "installable",
    "exe":      "installable",
    "zip":      "archive",
    "gz":       "archive",
    "tar":      "archive",
    "rar":      "archive"
  };
  
  var REG_EXP = /.+\.(\w+)(#|&|\?|$)/i;
  
  return function(url) {
    var suffix = (url.match(REG_EXP) || [, "unknown"])[1].toLowerCase();
    return {
      suffix: suffix,
      type:   mapping[suffix] || "unknown"
    };
  };
})();