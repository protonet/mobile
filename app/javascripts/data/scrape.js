protonet.data.Scraper = (function() {
  var TIMEOUT = 5000,
      URL     = protonet.config.node_base_url + "/scrape";
  
  function getData(url, selectors, onSuccess, onFailure){
    $.ajax({
      type: "GET",
      url: URL,
      data: {
        url: encodeURIComponent(url),
        selectors: selectors
      },
      cache: true,
      dataType: "jsonp",
      timeout: TIMEOUT,
      success: function(data) {
        if (!data.results) {
          return onFailure();
        }
        onSuccess(data.results);
      },
      error: onFailure
    })
  }
  
  return {
    getData: getData
  };
})();
