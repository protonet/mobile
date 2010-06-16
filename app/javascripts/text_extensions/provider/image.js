//= require "../../utils/parse_url.js"

/**
 * Image Provider
 */
protonet.text_extensions.provider.Image = {
  /**
   * TODO: Some wiki pages end with a typical image suffix "File:auto.jpg" (even though they are html pages)
   */
  REG_EXP: /.{13,}\.(jpe?g|gif|png)(\?.*)*/i,
  
  loadData: function(url, onSuccess, onFailure) {
    var testImg = new Image(),
        urlParts = protonet.utils.parseUrl(url);
    testImg.onerror = onFailure;
    testImg.onload = function() {
      onSuccess({
        title:        urlParts.filename,
        image:        url
      });
    };
    testImg.src = url;
  }
};