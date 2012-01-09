var http  = require('http'),
    https = require('https'),
    url   = require('url'),
    sys   = require('sys');

var toBase64 = function(str) {
  return  (new Buffer(str || "", "ascii")).toString("base64");
};

function request (options, callback) {
  if (!options.uri) {
    throw new Error("options.uri is a required argument")
  } else {
    if (typeof options.uri == "string") options.uri = url.parse(options.uri);
  }
  if (options.proxy) {
    if (typeof options.proxy == 'string') options.proxy = url.parse(options.proxy);
  }
  
  options._redirectsFollowed = options._redirectsFollowed ? options._redirectsFollowed : 0;
  options.maxRedirects = options.maxRedirects ? options.maxRedirects : 10;
    
  options.followRedirect = (options.followRedirect !== undefined) ? options.followRedirect : true;
  options.method = options.method ? options.method : 'GET';
  
  options.headers = options.headers ? options.headers :  {};
  if (!options.headers.host) {
    options.headers.host = options.uri.hostname;
    if (options.uri.port) {
      if ( !(options.uri.port === 80 && options.uri.protocol === 'http:') && 
           !(options.uri.port === 443 && options.uri.protocol === 'https:') )
      options.headers.host += (':'+options.uri.port)
    }
    var setHost = true;
  } else {
    var setHost = false;
  }
  
  if (!options.uri.pathname) {options.uri.pathname = '/'}
  if (!options.uri.port) {
    if (options.uri.protocol == 'http:') {options.uri.port = 80}
    else if (options.uri.protocol == 'https:') {options.uri.port = 443}
  }
  
  if (options.bodyStream) {
    sys.error('options.bodyStream is deprecated. use options.reponseBodyStream instead.');
    options.responseBodyStream = options.bodyStream;
  }
  
  var actualUri = (options.proxy ? options.proxy : options.uri);
  
  var secure = (actualUri.protocol == 'https:');
  options.client = (secure ? https : http);
  options.host = actualUri.hostname;
  options.port = actualUri.port;
  
  var clientErrorHandler = function (error) {
    if (setHost) delete options.headers.host;
    if (callback) callback(error);
  }
  
  if (options.uri.auth && !options.headers.authorization) {
    options.headers.authorization = "Basic " + toBase64(options.uri.auth);
  }
  if (options.proxy && options.proxy.auth && !options.headers['proxy-authorization']) {
    options.headers['proxy-authorization'] = "Basic " + toBase64(options.proxy.auth);
  }
  
  options.path = options.uri.href.replace(options.uri.protocol + '//' + options.uri.host, '');
  if (options.path.length === 0) options.path = '/' 
  
  if (options.proxy) options.path = (options.uri.protocol + '//' + options.uri.host + options.path)
  
  if (options.body) {options.headers['content-length'] = options.body.length}
  options.request = options.client.request(options, function (response) {
    var buffer;
    if (options.responseBodyStream) {
      buffer = options.responseBodyStream;
      if (!(response.statusCode > 299 && response.statusCode < 400))  {
        sys.pump(response, options.responseBodyStream);
      }
    }
    else {
      buffer = '';
      response.addListener("data", function (chunk) { buffer += chunk; } )
    }
    
    response.addListener("end", function () {
      options.request.removeListener("error", clientErrorHandler);
      
      if (response.statusCode > 299 && response.statusCode < 400 && options.followRedirect && response.headers.location && (options._redirectsFollowed < options.maxRedirects) ) {
        options._redirectsFollowed += 1
        options.uri = response.headers.location;
        delete options.client; 
        if (options.headers) {
          delete options.headers.host;
        }
        request(options, callback);
        return;
      } else {options._redirectsFollowed = 0}
      
      if (setHost) delete options.headers.host;
      if (callback) callback(null, response, buffer);
    })
  })
  options.request.addListener('error', clientErrorHandler);
  
  if (options.body) {
    options.request.write(options.body, 'binary');
    options.request.end();
  } else if (options.requestBodyStream) {
    sys.pump(options.requestBodyStream, options.request);
  } else {
    options.request.end();
  }
}

module.exports = request;

request.get = request;
request.post = function () {arguments[0].method = 'POST', request.apply(request, arguments)};
request.put = function () {arguments[0].method = 'PUT', request.apply(request, arguments)};
request.head = function () {arguments[0].method = 'HEAD', request.apply(request, arguments)};
