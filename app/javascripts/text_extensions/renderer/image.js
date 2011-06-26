//= require "../../media/proxy.js"
//= require "../../effects/hover_resize.js"

protonet.text_extensions.render.image = function(data, preventResizing) {
  var anchor = $("<a>", {
    href:   data.imageHref || data.url,
    target: "_blank"
  });
  
  var imageSize = {
    width:  Math.min(protonet.text_extensions.config.IMAGE_SIZE.width, data.imageWidth  || Infinity),
    height: Math.min(protonet.text_extensions.config.IMAGE_SIZE.height, data.imageHeight || Infinity)
  };
  
  var image = $("<img>", $.extend({
    src:    protonet.media.Proxy.getImageUrl(data.image, imageSize),
    alt:    data.imageTitle,
    title:  data.imageTitle
  }, imageSize));
  
  if (!preventResizing && !data.preventHoverEffect) {
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