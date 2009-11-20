protonet.data.YQL = {};
protonet.data.YQL.Query = function(query) {
  if (!query) {
    throw new Error("YQL Query: Missing query!");
  }
  
  this._query = query;
};


protonet.data.YQL.Query.prototype = {
  YQL_URL: "http://query.yahooapis.com/v1/public/yql?format=json&callback=?",
  
  execute: function(successCallback, failureCallback) {
    $.getJSON(this.YQL_URL, {
      q: this._query
    }, function(response) {
      if (response.error) {
        failureCallback(response);
      } else {
        successCallback(response);
      }
    });
  }
};