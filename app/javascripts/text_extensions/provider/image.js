//= require "../../utils/parse_url.js"
//= require "../../utils/parse_query_string.js"
//= require "../../utils/escape_for_reg_exp.js"

/**
 * Image Provider
 */
protonet.text_extensions.provider.Image = {
  /**
   * TODO: Some wiki pages end with a typical image suffix "File:auto.jpg" (even though they are html pages)
   */
  REG_EXP: /.{13,}\.(jpe?g|gif|png|bmp|tiff?|eps|psd|ps|ai)(\?.*)*/i,
  
  supportsMultiple: true,
  
  LIMIT: 10,
  
  loadData: function(urls, onSuccess, onFailure) {
    urls = $.makeArray(urls).slice(0, this.LIMIT);
    
    // Handle already proxied images
    urls = $.map(urls, function(url) {
      return protonet.media.Proxy.extractOriginalImageUrl(url);
    });
    
    var fileNames = $.map(urls, function(url) {
      var isFile = url.startsWith(protonet.data.File.getDownloadUrl(""));
      if (isFile) {
        var queryParams = protonet.utils.parseQueryString(url);
        return protonet.data.File.getName(queryParams.paths || queryParams.path);
      } else {
        return protonet.utils.parseUrl(url).filename.replace(/_/, " ");
      }
    });
    
    onSuccess({
      url:        urls[0],
      title:      fileNames.join(", "),
      imageTitle: fileNames.length > 1 ? fileNames : fileNames[0],
      imageHref:  urls.length > 1 ? urls : urls[0],
      image:      urls.length > 1 ? urls : urls[0]
    });
  }
};