//= require "../../utils/parse_url.js"
//= require "../../utils/escape_for_reg_exp.js"
//= require "../../media/proxy.js"

/**
 * Image Provider
 */
protonet.text_extensions.provider.Image = {
  /**
   * TODO: Some wiki pages end with a typical image suffix "File:auto.jpg" (even though they are html pages)
   */
  REG_EXP: /.{13,}\.(jpe?g|gif|png)(\?.*)*/i,
  
  loadData: function(url, onSuccess, onFailure) {
    // Handle already proxied images
    url = protonet.media.Proxy.extractOriginalImageUrl(url);
    
    var testImg       = new Image(),
        urlParts      = protonet.utils.parseUrl(url),
        titleAppendix,
        fileName      = urlParts.filename.replace(/[_-]/g, " ").replace(/\.(jpe?g|gif|png).*/, function(match, $1) {
          titleAppendix = $1;
          return "";
        });
    
    onSuccess({
      url:            url,
      title:          fileName,
      titleAppendix:  titleAppendix,
      image:          url
    });
  }
};