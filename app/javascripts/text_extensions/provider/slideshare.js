//= require "../../data/slideshare.js"

/**
 * Slideshare Provider
 */
protonet.text_extensions.provider.Slideshare = {
  /**
   * Matches:
   * http://www.slideshare.net/nathantwright/fostering-community-with-social-media-midwest-newspaper-summit-2010
   * http://www.slideshare.net/nathantwright/fostering-community-with-social-media-midwest-newspaper-summit-2010#test
   * http://www.slideshare.net/nathantwright/fostering-community-with-social-media-midwest-newspaper-summit-2010?a=2
   */
  REG_EXP: /slideshare\.net\/[\w-]+?\/[\w-]+?($|\?|\#)/i,
  
  loadData: function(url, onSuccess, onFailure) {
    protonet.data.SlideShare.getSlideShow(url, function(response) {
      onSuccess({
        description:  response.Description,
        image:        response.ThumbnailSmallURL,
        title:        response.Title,
        flash:        response.Embed && $(response.Embed).find("param[name=movie]").attr("value")
      });
    }, onFailure);
  }
};

