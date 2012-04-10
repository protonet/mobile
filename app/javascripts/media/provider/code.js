//= require "../../utils/escape_html.js"
//= require "../../utils/prettify_code.js"

protonet.media.provider.Code = {
  supportedMimeTypes: ["application/javascript", "application/json", "application/xml", "text/html", "text/css", "text/javascript", "text/plain"],
  
  render: function(file) {
    var deferred = $.Deferred(),
        $element = $("<pre>");
    
    protonet.data.File.getContent(file.path, {
      success: function(text, status, xhr) {
        text = protonet.utils.escapeHtml(text);
        var contentType = xhr.getResponseHeader("Content-Type");
        if (contentType === "text/plain") {
          text = protonet.utils.autoLink(text);
        } else {
          text = protonet.utils.prettifyCode(text);
        }
        $element.html(text);
        deferred.resolve($element);
      },
      error: function() {
        deferred.reject();
      }
    });
    
    return deferred.promise();
  }
};