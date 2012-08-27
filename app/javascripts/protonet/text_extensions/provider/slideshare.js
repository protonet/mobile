//= require "../../data/ext/slideshare.js"

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
  REG_EXP: /(.+?slideshare\.net\/[\w-]+?\/[\w-]+?)($|\?|\#)/i,
  
  loadData: function(url, onSuccess, onFailure) {
    var match = url.match(this.REG_EXP);
    protonet.data.SlideShare.getSlideShow(match[1], function(response) {
      onSuccess({
        description:    "Uploaded by " + response.author_name,
        image:          response.thumbnail,
        title:          response.title,
        titleAppendix:  response.total_slides + " slides",
        iframe:         response.html && $(response.html).find("iframe").attr("src")
      });
    }, onFailure);
  }
};

