//= require "../../utils/escape_for_reg_exp.js"

/**
 * Meep Provider
 */
protonet.text_extensions.provider.Meep = {
  URL:     "/tweets/{id}",
  REG_EXP: (function() {
    var escapedBaseUrl = protonet.utils.escapeForRegExp(protonet.config.base_url);
    return new RegExp(escapedBaseUrl + "(\\/#\\!)?\\/\\?meep_id\\=(\\d+)", "i");//(\\/#\\!)?
  })(),
  
  loadData: function(url, onSuccess, onFailure) {
    var match  = url.match(this.REG_EXP),
        meepId = match && +match[2];
    
    $.ajax({
      url: this.URL.replace("{id}", meepId),
      success: function(data) {
        onSuccess({
          image: protonet.config.base_url + data.avatar,
          title:          "Message from '" + data.author + "'",
          titleAppendix:  data.text_extension && "incl. '" + data.text_extension.type + "' attachment",
          description:    data.message
        });
      },
      error: onFailure
    });
  }
};