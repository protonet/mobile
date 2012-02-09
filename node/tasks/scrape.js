var HTML5 = require("./../modules/html5"),
  jsdom = require("./../modules/jsdom");

function stripScriptTags(body){
  // remove all Script tags;
  return body.replace(/<script[^>]*>([\S\s]*?)<\/script>/ig, "");
}

exports.scrape = function(params, response) {
  
  var uri =  decodeURIComponent(params["url"]),
    selector = params["selectors"],
    callback = params["callback"];
  
  require("./../modules/get.js")._get(uri, function(error, res){    
    
    //TODO: Handle request error
  
    if (!res) {
      console.log(error, res);
      response.end(JSON.stringify({error: "Could not fetch page."}));
      return;
    };
    
    var window = jsdom.jsdom(
      stripScriptTags(res.body), 
      null, {
        features: {
          FetchExternalResources : false,
          ProcessExternalResources: false,
          QuerySelector: true,
          MutationEvents: false
        }
        ,parser: HTML5
      }).createWindow();
    
    var data = {
        error: error,
        results: null
      },
      results = {};
    
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
        if (elem.innerHTML != "") {
          obj["content"] = elem.innerHTML.trim();
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
    
    response.writeHead(200, { "Content-Type": "application/json;" });
    
    if (callback) {
      response.end(callback + "(" + JSON.stringify(data) + ")");
    }else{
      response.end(JSON.stringify(data));
    }
    if (window) { window.close(); };
       
    //jsdom.env({
    //  html: uri,
    //  features: {
    //    'QuerySelector': true,
    //    'FetchExternalResources' : false,
    //    'ProcessExternalResources' : false
    //  },
    //  done: function(error, window){
    //    var data = {
    //      error: error,
    //      results: null
    //    }; 
    //
    //    if (!error) {
    //
    //      var results = {};
    //      
    //      try {
    //        var matches = window.document.querySelectorAll(selector);
    //        for(var j = 0; j < matches.length; j++){
    //          var elem = matches[j],
    //            obj = {},
    //            tagName = elem.tagName.toLowerCase();   
    //          for(i = 0; i < elem.attributes.length; i++){ 
    //            var attribute = elem.attributes[i];  
    //            obj[attribute.name] = attribute.value;
    //          }
    //          if (elem.innerHTML != "") {
    //            obj["content"] = elem.innerHTML.trim();
    //          };
    //          if (results[tagName]) {
    //            results[tagName].push(obj);
    //          }else{
    //            results[tagName] = [obj];
    //          }
    //        }
    //        data['results'] = results;
    //      }catch(e){
    //        data["error"] = e;
    //      }
    //      
    //    };
    //    
    //    response.writeHead(200, { "Content-Type": "application/json;" });
    //    
    //    if (callback) {
    //      response.end(callback + "(" + JSON.stringify(data) + ")");
    //    }else{
    //      response.end(JSON.stringify(data));
    //    }
    //    if (window) { window.close(); };
    //  }
    //});
  });
};
