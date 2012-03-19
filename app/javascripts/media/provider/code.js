//= require "../../lib/google_code_prettify.js"
//= require "../../utils/escape_html.js"

protonet.media.provider.Code = {
  supportedMimeTypes: ["application/javascript", "application/json", "application/xml", "text/html", "text/css", "text/javascript", "text/plain"],
  
  render: function(file) {
    var deferred = $.Deferred(),
        $element = $("<pre>");
    
    protonet.data.File.getContent(file.path, {
      success: function(text, status, xhr) {
        text = protonet.utils.escapeHtml(text);
        var contentType = xhr.getResponseHeader("Content-Type");
        if (contentType !== "text/plain") {
          text = prettyPrintOne(text);
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