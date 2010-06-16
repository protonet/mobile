//= require "../../data/flickr.js"

/**
 * Flickr Search Provider
 */
protonet.text_extensions.provider.FlickrSearch = {
  /**
   * Matches
   * http://www.flickr.com/search/?q=nude&w=13501089%40N00
   */
  REG_EXP: /flickr\.com\/search\/.*[\?&]q\=(.+?)($|&)/i,
  REG_EXP_SORT: /(&|\?)s=(\w*)/,
  
  SORT_TRANSLATION: {
    "int": "interestingness-desc",
    "rec": "date-posted-desc",
    "*": "relevance"
  },
  
  _extractQuery: function(url) {
    return decodeURIComponent(url.match(this.REG_EXP)[1].replace(/\+/g, " "));
  },
  
  _extractSort: function(url) {
    var match = url.match(this.REG_EXP_SORT),
        sortKey = match && decodeURIComponent(match[2]);
    return this.SORT_TRANSLATION[sortKey] || this.SORT_TRANSLATION["*"];
  },
  
  loadData: function(url, onSuccess, onFailure) {
    var query = this._extractQuery(url),
        sort = this._extractSort(url);
    
    protonet.data.Flickr.getPhotoSearch(query, sort, function(photos) {
      var images = $.map(photos, function(photo) {
        return photo.thumbnail.source;
      });
      
      var imageHrefs = $.map(photos, function(photo) {
        return photo.url;
      });
      
      var imageTitles = $.map(photos, function(photo) {
        return photo.title;
      });
      
      onSuccess({
        title:        "Search results for '" + query + "'",
        description:  imageTitles.join(", "),
        image:        images,
        imageTitle:   imageTitles,
        imageHref:    imageHrefs
      });
    }, onFailure);
  }
};