var fetchUrl = require("fetch").fetchUrl,
  jsdom = require("jsdom");
  
function stripScriptTags(body){
  // remove all Script tags;
  var content = body.replace(/<script[^>]*>([\S\s]*?)<\/script>/ig, "");
  return content.replace(/<!DOCTYPE[^>]*>/i, "");
}

exports.scrape = function(params, response) {
  
  var uri =  decodeURIComponent(params["url"]),
    selector = params["selectors"],
    callback = params["callback"],
    data = { error: null, results: null },
    results = {},
    options = { 
      "maxRedirects": 5,
      "headers": {
        "user-agent": 'Mozilla/5.0 (KHTML, like Gecko) Chrome/16.0.912.77 Safari/535.7 Protonet/1.0'
      },
      "maxResponseLength": 500000,
      "timeout": 4000 
    };
  
  fetchUrl(uri, options, function(error, meta, body){
      
    if (error) {
      response.end(JSON.stringify({error: error}));
      return;
    };
    jsdom.env({
      html: stripScriptTags(body.toString()),
      features: {
        "FetchExternalResources": false,
        "ProcessExternalResources": false,
        "QuerySelector": true,
        "MutationEvents": false
      },
      done: function(errors, window){
        try {
          var matches = window.document.querySelectorAll(selector);
          for(var j = 0; j < matches.length; j++){
            var elem = matches[j],
              obj = {},
              tagName = elem.tagName.toLowerCase();   
            for(i = 0; i < elem.attributes.length; i++){ 
              var attribute = elem.attributes[i];  
              obj[attribute.name] = attribute.value;
            }
            if (elem.textContent != "") {
              obj.content = elem.textContent.trim();
            };
            if (results[tagName]) {
              results[tagName].push(obj);
            }else{
              results[tagName] = [obj];
            }
          }
          data.results = results;
        }catch(e){
          data.error = e;
        }    
        if (callback) {
          response.end(callback + "(" + JSON.stringify(data) + ")");
        }else{
          response.end(JSON.stringify(data));
        }
        if (window) { window.close(); };
        
      }
    });
  });
};
