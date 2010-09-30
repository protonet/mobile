protonet.data.YQL = {};
protonet.data.YQL.Query = function(query) {
  this._query = query;
};


protonet.data.YQL.Query.prototype = {
  DEFAULT_TIMEOUT: 5000,
  YQL_URL: "http://query.yahooapis.com/v1/public/yql?format=json&_maxage=3600&diagnostics=false&callback=?",
  
  execute: function(onSuccess, onFailure, timeout) {
    $.jsonp({
      url: this.YQL_URL,
      data: {
        q: this._query
      },
      pageCache: true,
      cache: true,
      timeout: timeout || this.DEFAULT_TIMEOUT,
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