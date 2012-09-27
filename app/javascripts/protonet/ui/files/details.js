//= require "file.js"

protonet.ui.files.Details = (function() {
  return Class.create({
    initialize: function(data, fileList) {
      this.data     = protonet.ui.files.File.prototype.prepareData.call(this, data);
      this.fileList = fileList;
      this.$element = this.create();
    },
    
    create: function() {
      var $details = new protonet.utils.Template("file-details-template", this.data).to$();
      if (this.data.uploaderId === -1) {
        $details.find(".uploader").replaceWith($("<span>", { "class": "hint", text: protonet.t("files.hint_unknown_uploader") }));
      }
      return $details;
    },
    
    renderInto: function($container) {
      $container.html(this.$element).data("instance", this);
      protonet.data.File.scan(this.data.path, function(data) {
        var html;
        if (data.malicious === true) {
          html = "<span class='negative'>" + protonet.t("files.hint_virus") + "</span>";
        } else if (data.malicious === false) {
          html = "<span class='positive'>" + protonet.t("files.hint_no_virus") + "</span>";
        } else {
          html = "<span class='negative'>" + protonet.t("files.hint_no_virus_scan_available") + "</span>";
        }
        $container.find("output.virus-check").html(html);
      });
      protonet.media.embedFile($container.find("output.embed"), this.data);
    },
    
    remove: function() {
      this.$element.fadeOut("fast", this.destroy.bind(this));
    },
    
    disable: function() {
      this.$element.addClass("disabled");
    },
    
    enable: function() {
      this.$element.removeClass("disabled");
    },
    
    destroy: function() {
      this.$element.remove();
      
      if (this.fileList) {
        this.fileList.open(protonet.data.File.getFolder(this.data.path));
      }
      
      delete this.data;
    }
  });
})();