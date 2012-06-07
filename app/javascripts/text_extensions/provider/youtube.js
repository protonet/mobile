//= require "../../data/ext/youtube.js"
//= require "../../utils/format_seconds.js"

/**
 * YouTube Provider
 */
protonet.text_extensions.provider.YouTube = {
  /**
   * Matches:
   * http://www.youtube.com/watch?v=s4_4abCWw-w
   * http://www.youtube.com/watch#!v=ylLzyHk54Z
   * http://www.youtube.com/watch?feature=player_embedded&v=i9qW6HEBo_c
   * http://youtu.be/s4_4abCWw-w
   */
  REG_EXP: /(youtube\.com\/watch(\?|#\!).*?v\=|youtu\.be\/)([\w_-]*)/i,
  
  VIDEO_TEMPLATE: location.protocol + "//www.youtube.com/embed/{id}?playerapiid=ytplayer&egm=0&hd=1&showinfo=0&rel=0&autoplay=1&wmode=opaque",
  
  loadData: function(url, onSuccess, onFailure) {
    var videoId = url.match(this.REG_EXP)[3];
    
    protonet.data.YouTube.getVideo(videoId, function(response) {
      var mediaGroup = response["media$group"],
          isEmbeddable = !response["yt$noembed"];
      
      onSuccess({
        videoId:        videoId,
        image:          mediaGroup["media$thumbnail"][0].url,
        iframe:         isEmbeddable && this.VIDEO_TEMPLATE.replace("{id}", videoId),
        title:          mediaGroup["media$title"]["$t"],
        titleAppendix:  protonet.utils.formatSeconds(mediaGroup["yt$duration"].seconds),
        description:    mediaGroup["media$description"]["$t"],
        keywords:       mediaGroup["media$keywords"]["$t"]
      });
    }.bind(this), onFailure);
  }
};
