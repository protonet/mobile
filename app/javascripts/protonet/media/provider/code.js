protonet.media.provider.Code = {
  MAX_SIZE: 1 * 1024 * 1024, // 1 MB
  
  supportedFileExtensions: [
    "rb", "html", "htm", "xml", "java", "jsp", "js", "json", "css", "txt", "md", "textile",
    "as", "py", "c", "cc", "cgi", "fcgi", "gitignore", "git", "inc", "lisp", "make", "conf",
    "config", "configure", "coffee", "h", "cp", "dot", "cpp", "pl", "lua", "cs", "m", "yaml",
    "php", "pl", "php4", "php5", "cc", "applescript", "asp", "awk", "bat", "rdf", "rss", "nfo",
    "sql", "svn-base", "vim", "vxml", "xcodeproj", "patch", "diff", "m3u", "sfv"
  ],
  
  plainTextFileExtensions: ["txt", "md", "textile", "gitignore", "nfo", "m3u", "sfv"],
  
  supports: function(file) {
    var fileExtension = protonet.data.File.getExtension(file.path) || "txt";
    return file.size <= this.MAX_SIZE && this.supportedFileExtensions.indexOf(fileExtension) !== -1;
  },
  
  render: function(file, $container) {
    var deferred      = $.Deferred(),
        fileExtension = protonet.data.File.getExtension(file.path) || "txt",
        isPlainText   = this.plainTextFileExtensions.indexOf(fileExtension) !== -1,
        $element      = $("<pre>");
    
    protonet.data.File.getContent(file.path, {
      success: function(text, status, xhr) {
        text = protonet.utils.escapeHtml(text);
        if (isPlainText) {
          text = '<ol class="linenums">' + text.replace(/(.*?)(\r\n|\n|$)/g, "<li>$1</li>"); + '</ol>';
          text = protonet.utils.autoLink(text);
        } else {
          text = protonet.utils.prettifyCode(text, true);
        }
        $element.html(text);
        $container.html($element);
        deferred.resolve();
      },
      error: function() {
        deferred.reject();
      }
    });
    
    return deferred.promise();
  }
};