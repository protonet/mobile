var jsdom = require("jsdom");
  
function stripScriptTags(body){
  // remove all Script tags;
  var content = body.replace(/<script[^>]*>([\S\s]*?)<\/script>/ig, "");
  return content.replace(/<!DOCTYPE[^>]*>/i, "");
}

exports.scrape = function(params, response) {
  
  var uri =  decodeURIComponent(params["url"]),
    selector = params["selectors"],
    callback = params["callback"];
  
  require("./../modules/get.js")._get(uri, function(error, res){    
    
    response.writeHead(200, { "Content-Type": "application/json;" });
        
    if (!res) {
      response.end(JSON.stringify({error: error}));
      return;
    };
    
    var data = { error: error, results: null },
      results = {};
    
    jsdom.env({
      html: stripScriptTags(res.body),
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
