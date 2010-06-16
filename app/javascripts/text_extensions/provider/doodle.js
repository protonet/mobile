/**
 * Doodle Provider
 */
protonet.text_extensions.provider.Doodle = {
  /**
   * Matches
   * http://www.doodle.com/participation.html?pollId=w6azsxu3bmdw6zsw
   * http://www.doodle.com/embedPoll.html?pollId=w6azsxu3bmdw6zsw
   * http://www.doodle.com/w6azsxu3bmdw6zsw
   * http://doodle.com/2tx7z9y5uc22zqic?adminKey=&participantKey=
   */
  REG_EXP: /doodle\.com\/(participation\.html\?pollId\=)*([\w]+?($|\?))/i,
  IFRAME_TEMPLATE: "http://www.doodle.com/summary.html?pollId={id}",
  
  loadData: function(url, onSuccess, onFailure) {
    var pollId = url.match(this.REG_EXP)[2];
    
    onSuccess({
      pollId:                 pollId,
      iframe:                 this.IFRAME_TEMPLATE.replace("{id}", pollId),
      iframeRefreshInterval:  60
    });
  }
};