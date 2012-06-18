//= require "../../effects/hover_resize.js"
//= require "../../utils/to_max_size.js"

protonet.text_extensions.render.image = function(data, preventResizing) {
  var imageSize = {
    width:  Math.min(protonet.text_extensions.config.IMAGE_SIZE.width,  data.imageWidth  || Infinity),
    height: Math.min(protonet.text_extensions.config.IMAGE_SIZE.height, data.imageHeight || Infinity)
  };
  
  var title = data.imageTitle || data.title;
  
  var $figure = $("<figure>", { title: title });
  
  var $anchor = $("<a>", {
    href:   data.imageHref || data.url,
    target: "_blank"
  }).appendTo($figure);
  
  var $image = $("<img>", $.extend({
    src:    protonet.media.Proxy.getImageUrl(data.image, imageSize),
    alt:    data.imageTitle,
    load:   function() {
      var newSize = protonet.utils.toMaxSize({
        width:  $image.prop("naturalWidth"),
        height: $image.prop("naturalHeight")
      }, imageSize);
      
      $(this).unbind("load error").addClass("loaded").add($anchor).css({
        height: newSize.height.px(),
        width:  newSize.width.px()
      });
    },
    error:  function() {
      if ($anchor.siblings().length === 0) {
        $anchor.parent().remove();
      }
    }
  }, imageSize)).appendTo($anchor);
  
  if (title) {
    $("<figcaption>", { text: title }).appendTo($figure);
  }
  
  if (!preventResizing && !data.preventHoverEffect) {
    var options = protonet.text_extensions.config.HOVER_IMAGE_SIZE;
    options.extent = false;
    new protonet.effects.HoverResize($image, {
      newSrc:   protonet.media.Proxy.getImageUrl(data.image, options),
      newSize:  options
    });
  }
  
  return $figure;
};