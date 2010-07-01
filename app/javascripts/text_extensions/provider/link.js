//= require "../../data/meta_data.js"
//= require "../../media/screenshot.js"
//= require "../../utils/parse_url.js"
//= require "../../utils/strip_tracking_params.js"

/**
 * WebLink Provider
 */
protonet.text_extensions.provider.Link = {
  REG_EXP: /https?:\/\/.{4,}/i,
  
  loadData: function(url, onSuccess) {
    var queryUrl = protonet.utils.stripTrackingParams(url),
        urlParts = protonet.utils.parseUrl(queryUrl),
        shortUrl = urlParts.host + urlParts.path + urlParts.query;
    
    var metaDataCallback = function(response) {
      response = response || {};
      onSuccess({
        image: response.image_src || protonet.media.ScreenShot.get(queryUrl),
        flash: response.video_src,
        title: response.title || shortUrl,
        description: response.description || response.keywords,
        keywords: response.keywords
      });
    };
    
    protonet.data.MetaData.get(queryUrl, metaDataCallback, metaDataCallback);
  }
};