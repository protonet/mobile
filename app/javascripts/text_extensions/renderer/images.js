protonet.text_extensions.render.images = function(data) {
  var images = $();
  
  data.imageTitle = data.imageTitle || [];
  data.imageHref = data.imageHref || [];
  
  $.each(data.image, function(i) {
    images = images.add(
      protonet.text_extensions.render.image({
        image:      data.image[i],
        imageTitle: data.imageTitle[i],
        imageHref:  data.imageHref[i] || data.url
      })
    );
  });
  
  return images;
};