//= require "../../lib/pdfobject.js"

protonet.media.provider.PDF = {
  supportedMimeTypes: ["application/pdf"],
  
  render: function(file, size) {
    var deferred  = $.Deferred(),
        $element  = $("<div>", { "class": "object" }),
        src       = protonet.data.File.getDownloadUrl(file.path, { embed: true }).replace(/%2F/g, "/"),
        pdfObject = new PDFObject({ url: src }).embed($element[0]);
    if (pdfObject) {
      deferred.resolve($element);
    } else {
      deferred.reject();
    }
    return deferred.promise();
  }
};