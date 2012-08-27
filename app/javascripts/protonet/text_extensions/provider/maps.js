/**
 * Google Maps/StreetView Provider
 */
protonet.text_extensions.provider.Maps = (function() {
  var IMAGE_TEMPLATE = location.protocol
    + "//maps.googleapis.com/maps/api/staticmap?center={center}&sensor=false&zoom={zoom}&maptype={maptype}&size=100x75";
  
  var STREET_VIEW_IMAGE_TEMPLATE = "http://cbk0.google.com/cbk?output=thumbnail&w=100&h=75&ll={center}";
  
  var mapTypeMapping = {
    "h": "hybrid",
    "k": "sattelite",
    "e": "sattelite"
  };
  
  function extract(url, regExp) {
    var match = url.match(regExp) || [, ""];
    return decodeURIComponent(match[1].replace(/\+/g, " "));
  }
  
  function extractCoordinates(url) {
    return extract(url, (/(?:&|\?)ll=(.*?)(?:&|$)/));
  }
  
  function extractHNear(url) {
    return extract(url, (/(?:&|\?)hnear=(.*?)(?:&|$)/));
  }
  
  function extractQuery(url) {
    return extract(url, (/(?:&|\?)q=(.*?)(?:&|$)/));
  }
  
  function extractZoom(url) {
    var zoom = parseInt(extract(url, (/(?:&|\?)z=(\d+)(?:&|$)/)), 10);
    return zoom ? Math.max(zoom - 4, 0) : 10;
  }
  
  function extractMapType(url) {
    var mapType = extract(url, (/(?:&|\?)t=(.*?)(?:&|$)/));
    return mapTypeMapping[mapType] || "roadmap";
  }
  
  function isStreetView(url) {
    return url.indexOf("&cbp=") !== -1;
  }
  
  function getImage(url) {
    var coordinates = extractCoordinates(url),
        imageUrl;
    if (coordinates && isStreetView(url)) {
      imageUrl = STREET_VIEW_IMAGE_TEMPLATE;
    } else {
      imageUrl = IMAGE_TEMPLATE;
    }
    
    return imageUrl
      .replace("{center}",  encodeURIComponent(coordinates || extractQuery(url) || extractHNear(url)))
      .replace("{zoom}",    encodeURIComponent(extractZoom(url)))
      .replace("{maptype}", encodeURIComponent(extractMapType(url)));
  }
  
  return {
    /**
     * Matches
     * http://maps.google.de/?ie=UTF8&ll=37.0625,-95.677068&spn=31.977057,79.013672&z=4
     * http://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=hamburg&sll=37.0625,-95.677068&sspn=31.977057,79.013672&ie=UTF8&hq=&hnear=Hamburg,+Germany&z=10
     * http://www.google.de/maps?f=d&source=s_d&saddr=Schlangenkoppel,+Billstedt+22117+Hamburg&daddr=Merkenstra%C3%9Fe+to:53.554383,10.030475+to:Steinbeker+Marktstra%C3%9Fe+to:Schlangenkoppel,+Billstedt+22117+Hamburg&hl=de&geocode=FeUGMQMdDrWaACnT6e-V7IyxRzEXK3lGOLG-yw%3BFRb8MAMdtIiaAA%3B%3BFc7QMAMd3oaaAA%3BFeUGMQMdDrWaACnT6e-V7IyxRzEXK3lGOLG-yw&mra=dme&mrcr=0,1&mrsp=2&sz=15&via=1,3&dirflg=w&sll=53.554077,10.029187&sspn=0.01313,0.034161&ie=UTF8&ll=53.549487,10.085278&spn=0.052524,0.136642&z=13
     */
    REG_EXP: /(google\.[\w.]{2,5}\/maps)|(maps\.google\.[\w.]{2,5}\/)\?/i,
    
    loadData: function(url, onSuccess, onFailure) {
      var near          = extractHNear(url),
          query         = extractQuery(url),
          isStreetView  = url.indexOf("&cbp=") != -1,
          iframe        = url + (isStreetView ? "&output=svembed" : "&output=embed");
      
      onSuccess({
        image:          getImage(url),
        iframe:         iframe,
        description:    near && query,
        title:          near || query,
        titleAppendix:  isStreetView && "Street View"
      });
    }
  };
})();