//= require "../../ui/audio_player.js"

protonet.media.provider.Audio = {
  supports: function(file) {
    return protonet.media.Audio.canPlay(file.path);
  },

  render: function(file, $container) {
    var deferred          = $.Deferred(),
        src               = protonet.data.File.getDownloadUrl(file.path),
        audioPopupOpened  = window.__audioPopup && !window.__audioPopup.closed,
        player            = new protonet.ui.AudioPlayer(src, { autoPlay: !audioPopupOpened, playlist: false });
    player.renderInto($container);
    $container.data("audio_player", player);
    deferred.resolve();
    return deferred.promise();
  }
};
