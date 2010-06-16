//= require "../../media/proxy.js"
//= require "../../effects/hover_resize.js"

protonet.text_extensions.render.image = function(data, preventResizing) {
  var anchor = $("<a />", {
    href:   data.imageHref || data.url,
    target: "_blank"
  });
  
  var imageSize = protonet.text_extensions.config.IMAGE_SIZE;
  
  var image = $("<img />", $.extend({
    src:    protonet.media.Proxy.getImageUrl(data.image, imageSize),
    alt:    data.imageTitle,
    title:  data.imageTitle
  }, imageSize));
  
  if (!preventResizing) {
    var hoverImageSize = protonet.text_extensions.config.HOVER_IMAGE_SIZE;
    var hoverSrc = protonet.media.Proxy.getImageUrl(data.image, hoverImageSize);
    new protonet.effects.HoverResize(image, hoverImageSize, hoverSrc);
  }
  
  return anchor.append(image);
};