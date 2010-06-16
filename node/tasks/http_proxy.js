var http      = require("http"),
    parseUrl  = require("url").parse,
    sys       = require("sys");

exports.get = function(url, callback) {
  var urlObj  = parseUrl(url),
      proxy   = http.createClient(80, urlObj.host),
      body    = [],
      path    = (urlObj.pathname || "/") + (urlObj.search || "");
      
  sys.puts("http_proxy fetching: " + url);
  sys.puts("http_proxy path: " + path);
  
  var request = proxy.request("GET", path, {
    "Host": urlObj.host
  });
  
  request.addListener("response", function(response) {
    sys.puts("http_proxy response received - status code: " + response.statusCode);
    
    response.setEncoding("utf8");
    response.addListener("data", function(chunk) {
      sys.puts("http_proxy data received - length: " + chunk.length);
      body.push(chunk);
    });
    response.addListener("end", function() {
      sys.puts("http_proxy response end received.");
      callback({ body: body.join(""), statusCode: response.statusCode });
    });
  });
  request.end();
};