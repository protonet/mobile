//= require "../../utils/escape_html.js"

protonet.controls.TextExtension.Renderer = (function() {
  var template, templateHtml;
  
  return function(container, data, provider) {
    if (!provider) {
      var providerClass = protonet.controls.TextExtension.providers[data.type];
      if (!providerClass) {
        return;
      }
    
      provider = new providerClass(data.url);
      provider.setData(data);
    }
    
    template = template || $("#text-extension-template");
    templateHtml = templateHtml || $(template.html());
    
    var results = templateHtml.clone(),
        description = protonet.utils.escapeHtml(provider.getDescription()),
        title = protonet.utils.escapeHtml(provider.getTitle()),
        type = protonet.utils.escapeHtml(data.type),
        className = provider.CLASS_NAME;
    
    results.find(".description").html(description);
    results.find(".title").html(title);
    results.find(".type").html(type);
    results.find("a.link").attr("href", data.url);
    results.find(".media").html(provider.getMedia());
    results.addClass(data.type).addClass(className);
    
    
    container.append(results);
    
    this.resultsElement = results;
  };
})();
