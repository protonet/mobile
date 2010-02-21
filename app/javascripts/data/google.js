protonet.data.Google = {
  URL: "http://ajax.googleapis.com/ajax/services/search/web?v=1.0&callback=?",
  TIMEOUT: 4000,
  
  search: function(query, onSuccess, onFailure) {
    $.jsonp({
      url: this.URL,
      data: {
        q: query
      },
      cache: true,
      pageCache: true,
      timeout: this.TIMEOUT,
      success: function(response) {
        var responseData = response.responseData;
        
        if (!responseData || !responseData.results || responseData.results.length == 0) {
          return onFailure(response);
        }
        
        if (response.responseStatus != 200) {
          return onFailure(response);
        }
        
        onSuccess(responseData.results);
      },
      error: onFailure
    });
  }
};