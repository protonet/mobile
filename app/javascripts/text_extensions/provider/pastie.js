//= require "../../media/proxy.js"

protonet.text_extensions.provider.Pastie = {
  REG_EXP:  /.+?pastie\.org\/(?:pastes\/)?(\d+)/,
  TXT_URL:  "http://pastie.org/pastes/{id}/text",
  NICE_URL: "http://pastie.org/{id}",
  
  loadData: function(url, onSuccess, onFailure) {
    var id      = url.match(this.REG_EXP)[1],
        niceUrl = this.NICE_URL.replace("{id}", id),
        txtUrl  = this.TXT_URL.replace("{id}", id);
    
    protonet.media.Proxy.httpGet(txtUrl, function(body) {
      if (body) {
        onSuccess({
          code:         body,
          codeTitle:    niceUrl
        });
      } else {
        onFailure();
      }
    }, onFailure);
  }
};