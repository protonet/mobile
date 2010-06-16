/**
 * Google Maps/StreetView Provider
 */
protonet.text_extensions.provider.Maps = {
  /**
   * Matches
   * http://maps.google.de/?ie=UTF8&ll=37.0625,-95.677068&spn=31.977057,79.013672&z=4
   * http://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=hamburg&sll=37.0625,-95.677068&sspn=31.977057,79.013672&ie=UTF8&hq=&hnear=Hamburg,+Germany&z=10
   * http://www.google.de/maps?f=d&source=s_d&saddr=Schlangenkoppel,+Billstedt+22117+Hamburg&daddr=Merkenstra%C3%9Fe+to:53.554383,10.030475+to:Steinbeker+Marktstra%C3%9Fe+to:Schlangenkoppel,+Billstedt+22117+Hamburg&hl=de&geocode=FeUGMQMdDrWaACnT6e-V7IyxRzEXK3lGOLG-yw%3BFRb8MAMdtIiaAA%3B%3BFc7QMAMd3oaaAA%3BFeUGMQMdDrWaACnT6e-V7IyxRzEXK3lGOLG-yw&mra=dme&mrcr=0,1&mrsp=2&sz=15&via=1,3&dirflg=w&sll=53.554077,10.029187&sspn=0.01313,0.034161&ie=UTF8&ll=53.549487,10.085278&spn=0.052524,0.136642&z=13
   */
  REG_EXP: /(google\.[\w.]{2,5}\/maps)|(maps\.google\.[\w.]{2,5}\/)\?/i,
  
  _extractQuery: function(url) {
    var match = url.match(/&q=(.*?)&/i);
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  },
  
  _extractHNear: function(url) {
    var match = url.match(/&hnear=(.*?)&/i);
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  },
  
  loadData: function(url, onSuccess, onFailure) {
    var near = this._extractHNear(url),
        query = this._extractQuery(url),
        isStreetView = url.indexOf("&cbp=") != -1,
        iframe = url + (isStreetView ? "&output=svembed" : "&output=embed");
    
    onSuccess({
      iframe:       iframe,
      description:  near && query,
      title:        near || query
    });
  }
};