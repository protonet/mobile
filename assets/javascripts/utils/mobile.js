protonet.utils.mobile = {

  disableZoomOnFocus: function(){
    // prevent iOS from zooming onfocus http://nerd.vasilis.nl/prevent-ios-from-zooming-onfocus/
    var $viewportMeta = $('meta[name="viewport"]'); 
    $document.delegate('input, select, textarea', 'focus blur', function(event) { 
      $viewportMeta.attr('content', 'width=device-width,initial-scale=1,user-scalable=no,maximum-scale=' + (event.type == 'blur' ? 10 : 1)); 
    });
  }
  
}

