protonet.controls.TextExtension.Renderer = function(container, data, provider) {
  if (!provider) {
    provider = new protonet.controls.TextExtension.providers[data.type](data.url);
    provider.setData(data);
  }
  
  var template = $("#text-extension-template");
  var results = $(template.html());
  
  results.find(".description").html(provider.getDescription());
  results.find(".title").html(provider.getTitle());
  results.find(".type").html(data.type);
  results.find("a.link").attr("href", data.url);
  results.addClass(data.type);
  results.find(".media")
    .html(provider.getMedia())
    .click(provider.getMediaCallback());
  
  container.append(results);
  
  this.resultsElement = results;
};