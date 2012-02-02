/**
 * Facebook Data Provider
 *
 * TODO: Facebook usually supports open graph meta tags.
 * However we need to use embed.ly since YQL can't access facebook sites because it honors facebook's robots.txt
 * This can be removed when facebook white-lists the YQL bot or we switch to a different data scraper provider
 */
protonet.data.Facebook = (function() {
  var URL = location.protocol + "//api.embed.ly/1/oembed?url={url}&key=ec48ad80cf2c11e0b7f44040d3dc5c07&callback=?",
      TIMEOUT = 4000;
  
  function getData(url, onSuccess, onFailure) {
    $.ajax({
      url: URL.replace("{url}", encodeURIComponent(url)),
      cache: true,
      dataType: "jsonp",
      timeout: TIMEOUT,
      success: function(data) {
        if (!data) {
          return onFailure();
        }
        onSuccess(data);
      },
      error: onFailure
    });
  }
  
  return {
    getData: getData
  };
})();