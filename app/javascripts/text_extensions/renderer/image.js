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
    new protonet.effects.HoverResize(image, {
      newSize:    hoverImageSize,
      newSrc:     data.image,
      proxy:      true,
      keepRatio:  true
    });
  }
  
  return anchor.append(image);
};