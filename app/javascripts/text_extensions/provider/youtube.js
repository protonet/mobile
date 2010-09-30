//= require "../../data/youtube.js"
//= require "../../utils/format_seconds.js"

/**
 * YouTube Provider
 *
 * TODO:
 *  Use new embedding technique for embedding
 *  YouTube videos to support HTML5 video
 */
protonet.text_extensions.provider.YouTube = {
  /**
   * Matches:
   * http://www.youtube.com/watch?v=s4_4abCWw-w
   * http://www.youtube.com/watch#!v=ylLzyHk54Z
   * http://youtu.be/s4_4abCWw-w
   */
  REG_EXP: /(youtube\.com\/watch(\?|#\!)v\=|youtu\.be\/)([\w_-]*)/i,
  
  VIDEO_TEMPLATE: "http://www.youtube.com/v/{id}?playerapiid=ytplayer&autoplay=1&egm=0&hd=1&showinfo=0&rel=0",
  
  loadData: function(url, onSuccess, onFailure) {
    var videoId = url.match(this.REG_EXP)[3];
    
    protonet.data.YouTube.getVideo(videoId, function(response) {
      var mediaGroup = response["media$group"],
          isEmbeddable = !response["yt$noembed"];
      
      onSuccess({
        videoId:        videoId,
        image:          mediaGroup["media$thumbnail"][0].url,
        flash:          isEmbeddable && this.VIDEO_TEMPLATE.replace("{id}", videoId),
        title:          mediaGroup["media$title"]["$t"],
        titleAppendix:  protonet.utils.formatSeconds(mediaGroup["yt$duration"].seconds),
        description:    mediaGroup["media$description"]["$t"],
        keywords:       mediaGroup["media$keywords"]["$t"]
      });
    }.bind(this), onFailure);
  }
};
