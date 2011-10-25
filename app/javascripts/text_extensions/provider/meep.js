//= require "../../utils/escape_for_reg_exp.js"

/**
 * Meep Provider
 */
protonet.text_extensions.provider.Meep = {
  URL:     "/meeps/{id}",
  
  REG_EXP: (function() {
    var escapedBaseUrl = protonet.utils.escapeForRegExp(protonet.config.base_url);
    return new RegExp(escapedBaseUrl + "(\\/#\\!)?\\/meep/(\\d+)", "i");
  })(),
  
  loadData: function(url, onSuccess, onFailure) {
    var match  = url.match(this.REG_EXP),
        meepId = match && +match[2];
    
    $.ajax({
      dataType: "json",
      url: this.URL.replace("{id}", meepId),
      success: function(data) {
        onSuccess({
          image:              protonet.config.base_url + data.avatar,
          imageWidth:         24,
          imageHeight:        24,
          preventHoverEffect: true,
          title:              "@" + data.author + ":",
          description:        data.message || data.text_extension.url
        });
      },
      error: onFailure
    });
  }
};