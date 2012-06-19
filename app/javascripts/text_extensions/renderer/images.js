protonet.text_extensions.render.images = function(data) {
  var $images = $();
  
  data.imageTitle = data.imageTitle || [];
  data.imageHref  = data.imageHref  || [];
  
  $.each(data.image.slice(0, protonet.text_extensions.config.MAX_IMAGES), function(i) {
    var $figure = $("<figure>");
    
    var title = data.imageTitle[i];
    
    var $image = protonet.text_extensions.render.image({
      image:              data.image[i],
      imageTitle:         data.imageTitle[i],
      imageHref:          data.imageHref[i] || data.url,
      imageWidth:         data.imageWidth,
      imageHeight:        data.imageHeight,
      preventHoverEffect: data.preventHoverEffect
    }).appendTo($figure);
    
    if (title) {
      $("<figcaption>", { text: title }).appendTo($figure);
    }
    
    $images = $images.add($figure);
  });
  
  return $images;
};