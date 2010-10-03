//= require "../../data/vimeo.js"
//= require "../../utils/format_seconds.js"

/**
 * Vimeo Provider
 */
protonet.text_extensions.provider.Vimeo = {
  /**
   * Matches:
   * http://vimeo.com/9669721
   */
  REG_EXP: /vimeo\.com\/(\d+)/i,
  
  VIDEO_TEMPLATE: "http://vimeo.com/moogaloop.swf?clip_id={id}" +
    "&server=vimeo.com&show_title=1&show_byline=1&show_portrait=0&color=&fullscreen=1",
  
  loadData: function(url, onSuccess, onFailure) {
    var videoId = url.match(this.REG_EXP)[1];
    
    protonet.data.Vimeo.getVideo(videoId, function(response) {
      onSuccess({
        videoId:        videoId,
        description:    response.description,
        image:          response.thumbnail_small,
        flash:          this.VIDEO_TEMPLATE.replace("{id}", videoId),
        title:          response.title,
        titleAppendix:  protonet.utils.formatSeconds(response.duration),
        keywords:       response.tags
      });
    }.bind(this), onFailure);
  }
};