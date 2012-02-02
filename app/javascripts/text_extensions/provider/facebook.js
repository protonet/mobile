//= require "../../data/ext/facebook.js"

/**
 * Facebook Provider
 */
protonet.text_extensions.provider.Facebook = {
  /**
   * Matches:
   * http://www.facebook.com/christopher.blum
   */
  REG_EXP: /facebook\.com\/.+/i,
  
  loadData: function(url, onSuccess, onFailure) {
    protonet.data.Facebook.getData(url, function(response) {
      var flash;
      if (response.html) {
        flash = $(response.html).find("embed[src]").attr("src");
      }
      onSuccess({
        image:          response.thumbnail_url || (protonet.config.base_url + "/img/logo_facebook.jpg"),
        title:          response.title,
        description:    response.description,
        flash:          flash
      });
    }, onFailure);
  }
};
