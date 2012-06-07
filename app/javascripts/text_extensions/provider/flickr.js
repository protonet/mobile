//= require "../../data/ext/flickr.js"

/**
 * Flickr Provider
 */
protonet.text_extensions.provider.Flickr = {
  /**
   * Matches:
   * http://www.flickr.com/photos/phil76/4307719822/
   */
  REG_EXP: /flickr\.com\/photos\/[\w@-_]+?\/(\d{1,20})/i,
  
  loadData: function(url, onSuccess, onFailure) {
    var photoId = url.match(this.REG_EXP)[1];
    
    protonet.data.Flickr.getPhoto(photoId, function(response) {
      onSuccess({
        title:        response.title,
        description:  response.description,
        image:        response.preview.source
      });
    }, onFailure);
  }
};
