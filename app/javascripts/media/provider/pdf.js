//= require "../../lib/pdfobject.js"

protonet.media.provider.PDF = {
  supportedMimeTypes: ["application/pdf"],
  
  supports: function(file) {
    return this.supportedMimeTypes.indexOf(file.mime) !== -1;
  },
  
  render: function(file, $container) {
    var deferred  = $.Deferred(),
        $element  = $("<div>", { "class": "object" }),
        src       = protonet.data.File.getDownloadUrl(file.path, { embed: true }),
        pdfObject = new PDFObject({
          url: src,
          // PDF OPEN PARAMETERS don't work in Chrome:
          // http://code.google.com/p/chromium/issues/detail?id=64309
          pdfOpenParams: { zoom: "scale" }
        }).embed($element[0]);
    if (pdfObject) {
      $container.html($element);
      deferred.resolve();
    } else {
      deferred.reject();
    }
    return deferred.promise();
  }
};