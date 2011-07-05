//= require "../../media/proxy.js"

protonet.text_extensions.provider.Gist = {
  REG_EXP:  /gist\.github\.com\/(\d+)/,
  TXT_URL:  "https://raw.github.com/gist/{id}",
  
  loadData: function(url, onSuccess, onFailure) {
    var id = url.match(this.REG_EXP)[1],
        txtUrl = this.TXT_URL.replace("{id}", id);
    
    protonet.media.Proxy.httpGet(txtUrl, function(body) {
      if (body) {
        onSuccess({
          code:      body,
          codeTitle: url
        });
      } else {
        onFailure();
      }
    }, onFailure);
  }
};