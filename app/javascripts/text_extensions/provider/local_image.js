//= require "../../utils/escape_for_reg_exp.js"

/**
 * LocalImage Provider
 */
protonet.text_extensions.provider.LocalImage = {
  REG_EXP: (function() {
    var escapedBaseUrl = protonet.utils.escapeForRegExp(protonet.config.base_url);
    return new RegExp(escapedBaseUrl + ".+\.(jpe?g|gif|png)", "i");
  })(),
  
  FILENAME_REG_EXP: /file_path\=.*%2F(.+\.(jpe?g|gif|png))/i,
  
  loadData: function(url, onSuccess, onFailure) {
    var match = url.match(this.FILENAME_REG_EXP),
        imageName = match && match[1];
    
    onSuccess({
      image: url,
      title: decodeURIComponent(imageName || "untitled")
    });
  }
};