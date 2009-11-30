protonet.data.YQL = {};
protonet.data.YQL.Query = function(query) {
  if (!query) {
    throw new Error("YQL Query: Missing query!");
  }
  
  this._query = query;
};


protonet.data.YQL.Query.prototype = {
  TIMEOUT: 5000, // 5 seconds
  YQL_URL: "http://query.yahooapis.com/v1/public/yql?format=json&callback=?",
  
  execute: function(onSuccessCallback, onFailureCallback) {
    var timeouted, fallback = setTimeout(function() {
      timeouted = true;
      onFailureCallback();
    }, this.TIMEOUT);
    
    $.getJSON(this.YQL_URL, {
      q: this._query
    }, function(response) {
      if (timeouted) { return; }
      clearTimeout(fallback);
      
      if (response.error) {
        onFailureCallback(response);
      } else {
        onSuccessCallback(response);
      }
    });
  }
};