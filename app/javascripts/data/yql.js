protonet.data.YQL = {};
protonet.data.YQL.Query = function(query) {
  this._query = query;
};


protonet.data.YQL.Query.prototype = {
  TIMEOUT: 5000,
  YQL_URL: "http://query.yahooapis.com/v1/public/yql?format=json&_maxage=3600&diagnostics=false&callback=?",
  
  execute: function(onSuccess, onFailure) {
    $.jsonp({
      url: this.YQL_URL,
      data: {
        q: this._query
      },
      pageCache: true,
      cache: true,
      timeout: this.TIMEOUT,
      success: function(response) {
        response = response || {};
        
        if (response.error) {
          return onFailure(response);
        }
        
        var results = response.query && response.query.results;
        if (!results) {
          return onFailure(response);
        }
        
        onSuccess(results);
      },
      error: onFailure
    });
  }
};