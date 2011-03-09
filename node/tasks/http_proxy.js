var http      = require("http"),
    https     = require("https"),
    parseUrl  = require("url").parse,
    sys       = require("sys");

exports.get = function(url, callback) {
  var urlObj  = parseUrl(url),
      path    = (urlObj.pathname || "/") + (urlObj.search || ""),
      client  = urlObj.protocol === "https:" ? https : http,
      options = {
        host: urlObj.host,
        path: path
      };
      
  sys.puts("http_proxy fetching: " + url);
  sys.puts("http_proxy path: " + path);

  client.get(options, function(response) {
    var body = [];
    console.log("Got response: " + response.statusCode);
    response.addListener("data", function(chunk) {
      console.log("http_proxy data received - length: " + chunk.length);
      body.push(chunk);
    });
    response.addListener("end", function() {
      var responseText = body.join("");
      console.log("http_proxy response end received - data:" + responseText);
      callback({ body: responseText, statusCode: response.statusCode }, "http_proxy");
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};