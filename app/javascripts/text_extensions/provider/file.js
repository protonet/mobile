//= require "../../utils/escape_for_reg_exp.js"
//= require "../../utils/parse_query_string.js"

/**
 * LocalImage Provider
 */
protonet.text_extensions.provider.File = {
  REG_EXP: (function() {
    var escapedBaseUrl = protonet.utils.escapeForRegExp(protonet.data.File.getBaseUrl() + "?path=");
    return new RegExp(escapedBaseUrl + ".+", "i");
  })(),
  
  supportsMultiple: true,
  
  LIMIT:            25,
  
  loadData: function(urls, onSuccess, onFailure) {
    urls = $.makeArray(urls).slice(0, this.LIMIT);
    
    var paths = $.map(urls, function(url) {
      return protonet.utils.parseQueryString(url).path;
    });
    
    var title;
    if (paths.length > 1) {
      title = "Files on this box";
    } else {
      title = protonet.data.File.getName(paths[0]);
    }
    
    onSuccess({
      title: title,
      files: paths
    });
  }
};