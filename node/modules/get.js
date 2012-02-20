var http = require('http'),
  https = require('https'),
  u = require('url'),
  zlib = require('zlib'),
  iconv = require('iconv-lite');

/**
 * prepare options the input parameters for get()
 * @param options
 * @param reqId
 * @returns object
 */
function prepareOptions(options, reqId){
  if (typeof(options) === "string") {
    options = {
      url: options
    }
  }; 
  
  if (reqId == undefined) { reqId = 0;  }
  if (!options.redirects) { options.redirects = 10; };
  if (!options.headers) { options.headers = {} };
  
  var url = options.url.trim();
  
  var uri = u.parse(url);
  
  var httpOptions = {
    host: uri.hostname,
    port: uri.port,
    path: uri.path,
    agent: false
  };
  
  if (!options.connection) {
    options.headers['connection'] = 'keep-alive';
  };
  
  if (!options.nogzip && zlib) {  
    options.headers['accept-encoding'] = 'gzip,deflate';
  } else if (options.headers['accept-encoding']) {
    delete(options.headers['accept-encoding']);
  }
  
  if (!options.headers['user-agent']) {
    // TODO: use better User-Agent
    options.headers['user-agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.7 (KHTML, like Gecko) Chrome/16.0.912.77 Safari/535.7 Protonet/1.0'
  }
  
  httpOptions.headers = options.headers;
  
  return {
    httpOptions: httpOptions,
    options: options,
    reqId: reqId,
    protocol: uri.protocol
  }
  
};

/**
 * Prepares the redirect target
 * @param url
 * @param location
 * @returns string
 */
function prepareRedirectUrl(url, location) {
  var original = u.parse(url);
  var location = u.parse(location);
  if ( ! location.protocol) {
    location.protocol = original.protocol;
  }
  if ( ! location.host) {
    location.host = original.host;
  }
  return u.format(location);
};

function _get(options, callback, reqId){
  var client,
  params = prepareOptions(options, reqId);
  options = params.options;
  reqId = params.reqId,
  maxContentLength = 500000;
  
  if (params.protocol === "http:") {
    client = http;
  }else{
    client = https
  }
    
  var request = client.get(params.httpOptions);
  
  request.on('response', function(response){
        
    switch (response.statusCode) { 
      case 200: // success
      
        var contentType = /text\/html|application\/xhtml\+xml/.exec(response.headers["content-type"]);
        if (!contentType) {
          callback("Pages content-type does not look like a Webpage", null);
          request.abort();
          return;
        };
        
        var contentLength = response.headers['content-length'];
        if (contentLength && contentLength > maxContentLength) {
          callback("Content is too big.", null);
          request.abort();
          return;
        };
        
        var charset = /charset=(.+)/.exec(response.headers["content-type"]),
          unzip = zlib.createUnzip(),
          buf = '';
        
        if (charset) {
          charset = charset[1].toLowerCase().replace(/iso-8859-(.)/,"latin-1");
        }else{
          charset = "utf-8";
        }
          
        if (response.headers['content-encoding'] && unzip) {
          response.pipe(unzip);
          
          unzip.on("data", function(chunk){
            if (charset) {
              buf += iconv.fromEncoding(chunk, charset);
            }else{
              buf += chunk;
            }
            if (buf.length > maxContentLength) {
              callback("Content is too big.", null);
              request.abort();
              return;
            };
          });

          unzip.on("end", function() {
            callback(null, {
              headers: response.headers,
              body: buf.toString("binary")
            });
          });
          
          unzip.on("error",function(e) {
            console.log(e);
          })
          
        }else{
          response.on("data", function(chunk){
            // response gzip
            if (charset != "utf-8") {
              response.setEncoding("binary")
              buf += iconv.fromEncoding(chunk, charset)
            }else{
              buf += chunk;      
            }
            if (buf.length > maxContentLength) {
              callback("Content is too big.", null);
              request.abort();
              return;
            };
          });
          response.on("end", function(){
            callback(null, {
              headers: response.headers,
              body: buf.toString()
            });
          });
        }
        
        break;
      case 300: // redirect
      case 301:
      case 302:
      case 303:
      case 305:
      case 307:
        if (!response.headers.location) {
          var err = new Error('Redirect response without location header.');
          err.code = response.statusCode;
          err.headers = response.headers;
          callback(err, null);
        } else {
          options.url = prepareRedirectUrl(options.url, response.headers.location);
          if (reqId < options.redirects) {
            reqId++;
            _get(options, callback, reqId);
          } else {
            var err = new Error('Redirect loop detected after ' + Number(reqId) + ' requests.');
            err.code = response.statusCode;
            err.headers = response.headers;
            callback(err, null);
          }
        }
      break;
      case 304:
        var ret = {
          code: 304,
          headers: response.headers
        };
        if (reqId > 0) {
          ret.url = options.url;
        }
        callback(null, ret);
      break;
      default: // error
        var err = new Error('HTTP Error: ' + Number(response.statusCode));
        err.code = response.statusCode;
        err.headers = response.headers;
        callback(err, null);
      break;
    }
  });
  
  request.on('error', function(e){
    callback(e, null);
  });
  
}
exports._get = _get;