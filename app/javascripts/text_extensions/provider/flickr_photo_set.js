//= require "../../data/flickr.js"

/**
 * Flickr Photo Set Provider
 */
protonet.text_extensions.provider.FlickPhotoSet = {
  /**
   * Matches:
   * http://www.flickr.com/photos/lanphere/sets/72157594401592067/
   */
  REG_EXP: /flickr\.com\/photos\/.+?\/sets\/(\d{1,20})/i,
  
  loadData: function(url, onSuccess, onFailure) {
    var photoSetId = url.match(this.REG_EXP)[1];
    
    protonet.data.Flickr.getPhotoSet(photoSetId, function(photos) {
      var images = $.map(photos, function(photo) {
        return photo.preview.source;
      });
      
      var imageTitles = $.map(photos, function(photo) {
        return photo.title;
      });
      
      var imageHrefs = $.map(photos, function(photo) {
        return photo.url;
      });
      
      onSuccess({
        title:        "Flickr Photo Set",
        description:  imageTitles.join(", "),
        image:        images,
        imageTitle:   imageTitles,
        imageHref:    imageHrefs
      });
    }, onFailure);
  }
};