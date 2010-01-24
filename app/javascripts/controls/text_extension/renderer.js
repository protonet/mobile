//= require "../../utils/escape_html.js"

protonet.controls.TextExtension.Renderer = function(container, data, provider) {
  if (!provider) {
    provider = new protonet.controls.TextExtension.providers[data.type](data.url);
    provider.setData(data);
  }
  
  var template = $("#text-extension-template"),
      results = $(template.html()),
      description = protonet.utils.escapeHtml(provider.getDescription()),
      title = protonet.utils.escapeHtml(provider.getTitle()),
      type = protonet.utils.escapeHtml(data.type);
      
  
  results.find(".description").html(description);
  results.find(".title").html(title);
  results.find(".type").html(type);
  results.find("a.link").attr("href", data.url);
  results.addClass(data.type);
  results.find(".media")
    .html(provider.getMedia())
    .click(provider.getMediaCallback());
  
  container.append(results);
  
  this.resultsElement = results;
};