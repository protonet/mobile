protonet.controls.TextExtension = {
  initialize: function() {
    $(this.renderQueue.bind(this));
  },
  
  renderQueue: function() {
    if (protonet.globals.textExtensions && protonet.globals.textExtensions.length) {
      $.each(protonet.globals.textExtensions, function(i, val) {
        //new this.Renderer()
      });
    }
    
    protonet.globals.textExtensions = [];
  },
  
  render: function(container, data) {
    return new this.Renderer(container, data);
  }
};

//= require "text_extension/renderer.js"
//= require "text_extension/input.js"
//= require "text_extension/providers.js"