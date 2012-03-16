//= require "provider.js"

protonet.media.embedFile = function($container, file) {
  var providers = protonet.media.provider,
      provider,
      src,
      providerName;
  
  function fallback() {
    $container.html($("<p>", { "class": "hint", text: protonet.t("FILE_PREVIEW_ERROR") }));
  }
  
  for (providerName in providers) {
    provider = providers[providerName];
    if (provider.supportedMimeTypes.indexOf(file.mime) !== -1) {
      src = protonet.data.File.getDownloadUrl(file.path);
      provider
        .render(src, { width: $container.width() })
        .done(function($element) { $container.addClass(providerName).html($element); })
        .fail(fallback);
      return;
    }
  }
  fallback();
};