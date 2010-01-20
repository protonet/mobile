protonet.utils.autoLinkFilePaths = (function() {
  /**
   * File paths are on the following format:
   * "bla bla file:/system/files/show?file_path=test.jpg bla bla"
   */
  var REG_EXP_PATH = /file:(.*?[^\<\s\,]+)/g,
      REG_EXP_FILE_NAME = /file_path=.*%2F(.*)/,
      MAX_DISPLAY_LENGTH = 40;
  
  function extractFileName(path) {
    var match = path.match(REG_EXP_FILE_NAME);
    return match && match[1] && decodeURIComponent(match[1]);
  }
  
  function autoLinkFilePaths(str) {
    return str.replace(REG_EXP_PATH, function(match, path) {
      var fileName = extractFileName(path);

      return fileName
        ? ('<a href="' + path + '">' + fileName.truncate(MAX_DISPLAY_LENGTH) + '</a>')
        : match;
    });
  }
  
  return autoLinkFilePaths;
})();