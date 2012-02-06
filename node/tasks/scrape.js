var jsdom = require("./../modules/jsdom");

exports.scrape = function(params, response) {
  
  var url =  decodeURIComponent(params["url"]),
    selector = params["selectors"],
    callback = params["callback"];
  
  jsdom.env({
    html: url,
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.71 Safari/534.24'
    },
    features: {
      'QuerySelector': true,
      'FetchExternalResources' : false,
      'ProcessExternalResources' : false
    },
    done: function(errors, window) {      
      var matches,
        returnJSON,
        error = null;
      
      try{
        
        if (errors) { throw(errors); };
        
        var results = {};
        
        matches = window.document.querySelectorAll(selector);
        for(var j = 0; j < matches.length; j++){
          var elem = matches[j],
            obj = {},
            tagName = elem.tagName.toLowerCase();   
          for(i = 0; i < elem.attributes.length; i++){ 
            var attribute = elem.attributes[i];  
            obj[attribute.name] = attribute.value;
          }
          if (elem.innerHTML != "") {
            obj["content"] = elem.innerHTML;
          };
          if (results[tagName]) {
            results[tagName].push(obj);
          }else{
            results[tagName] = [obj];
          }
        }
        
      }catch(e){
        error = "An error occured: " + e.toString()
      }
    
      response.writeHead(200, { "Content-Type": "application/json" });
      
      returnJSON = JSON.stringify({
        results: results,
        error: error
      });
      
      if (callback) {
        returnJSON = callback + "(" + returnJSON+ ")"
      }
      
      response.end(returnJSON);
      
      if (window) {
        window.close();
      };
      
    }
  });
};