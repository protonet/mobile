//= require "provider.js"

protonet.media.embedFile = function($container, file) {
  var providers = protonet.media.provider,
      provider,
      providerName;
  for (providerName in providers) {
    provider = providers[providerName];
    if (provider.supportedMimeTypes.indexOf(file.mime) !== -1) {
      var src     = protonet.data.File.getDownloadUrl(file.path),
          options = { width: $container.width() };
      console.log($container);
      $container.addClass(providerName).html(provider.render(src, options));
      break;
    }
  }
};