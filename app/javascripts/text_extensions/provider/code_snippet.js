//= require "../../media/proxy.js"

protonet.text_extensions.provider.CodeSnippet = {
  REG_EXP: /(pastie\.org\/pastes\/\d+)|(gist\.github\.com\/\d+)/,
  
  loadData: function(url, onSuccess, onFailure) {
    var niceUrl = url.replace(/(\?|#|(\.txt)).*/, ""),
        txtUrl = niceUrl + ".txt";
    
    protonet.media.Proxy.httpGet(txtUrl, function(body) {
      if (body) {
        onSuccess({
          title:        "Code Snippet",
          code:         body,
          codeTitle:    niceUrl
        });
      } else {
        onFailure();
      }
    }, onFailure);
  }
};