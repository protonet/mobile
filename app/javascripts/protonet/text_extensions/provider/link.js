//= require "../../data/ext/meta_data.js"
//= require "../../media/get_screenshot.js"
//= require "../../utils/parse_url.js"
//= require "../../utils/strip_tracking_params.js"

/**
 * WebLink Provider
 */
protonet.text_extensions.provider.Link = {
  REG_EXP: /https?:\/\/.{4,}/i,
  REG_EXP_AJAX_PARAM: /\#\!?\//,
  
  loadData: function(url, onSuccess) {
    var queryUrl = protonet.utils.stripTrackingParams(url),
        urlParts = protonet.utils.parseUrl(queryUrl),
        shortUrl = urlParts.host + urlParts.path + urlParts.query;
    
    // Strip ajax hash (often used for crawlable ajax content)
    queryUrl = queryUrl.replace(this.REG_EXP_AJAX_PARAM, "");
    
    var metaDataCallback = function(response) {
      response = response || {};
      onSuccess({
        image:        response.image_src || protonet.media.getScreenShot(queryUrl),
        flash:        response.video_src,
        title:        response.title || shortUrl,
        description:  response.description || response.keywords,
        keywords:     response.keywords
      });
    };
    
    protonet.data.MetaData.get(queryUrl, metaDataCallback, metaDataCallback);
  }
};