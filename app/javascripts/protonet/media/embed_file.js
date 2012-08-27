//= require "provider.js"

protonet.media.embedFile = function($container, file) {
  var providers = protonet.media.provider,
      provider,
      providerName;
  
  function fallback() {
    $container.html($("<p>", { "class": "hint", text: protonet.t("FILE_PREVIEW_ERROR") }));
  }
  
  for (providerName in providers) {
    provider = providers[providerName];
    if (provider.supports(file)) {
      provider
        .render(file, $container)
        .done(function() { $container.addClass(providerName); })
        .fail(fallback);
      return;
    }
  }
  fallback();
};