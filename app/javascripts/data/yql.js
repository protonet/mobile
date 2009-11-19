protonet.data.YQL = {};
protonet.data.YQL.Query = function(query) {
  if (!query) {
    throw new Error("YQL Query: Missing query!");
  }
  
  this._query = query;
};


protonet.data.YQL.Query.prototype = {
  YQL_URL: "http://query.yahooapis.com/v1/public/yql?format=json&callback=?",
  
  execute: function(successCallback) {
    $.getJSON(this.YQL_URL, {
      q: this._query
    }, successCallback);
  }
};