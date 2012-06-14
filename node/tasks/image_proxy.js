var http            = require("http"),
    parseUrl        = require("url").parse,
    sys             = require("util"),
    magick          = require('./../modules/node-magick'),
    path            = require('path'),
    fs              = require("fs"),
    md5             = require("./../modules/md5").create,
    child           = require('child_process'),
    request         = require('./../modules/node-utils/request'),
    lookupMime      = require('mime').lookup,
    ONE_YEAR        = 365 * 24 * 60 * 60 * 1000,
    SUFFIX_REG_EXP  = /.+(\.\w+)($|\?|#)/,
    KEEP_FORMATS    = /^\.(jpe?g|gif|png)$/i,
    image_requests  = {};


exports.proxy = function(params, headers, response) {
  function resultingFileName(params, base) {
    var baseString = process.cwd() + "/public/externals/image_proxy/" + md5(params.url),
        suffix     = (params.url.match(SUFFIX_REG_EXP) || [, ""])[1];
    
    if (params.url.indexOf("/screenshooter") !== -1) {
      suffix = ".png";
    }
    
    if (base) {
      return baseString + suffix;
    }
    
    if (params.width || params.height) {
      baseString += "_" + params.width + "_" + params.height;
    }
    
    // convert tiff, bmp, ... to jpg
    if (suffix && !suffix.match(KEEP_FORMATS)) {
      suffix = ".jpg";
    }
    
    return baseString + suffix;
  }
  
  function sendImage(fileName) {
    // once done send all
    var mimeType  = lookupMime(fileName),
        header    = {},
        size;
    
    try {
      size = fs.lstatSync(fileName).size;
    } catch(e) { send404(filename); }
    
    if (mimeType === "application/octet-stream") {
      mimeType = "image/jpeg";
    }
    
    header["Content-Type"] = mimeType;
    header["Content-Length"] = size;
    
    // Caching header
    if (global.env === "production") {
      header["Expires"]       = new Date(new Date().getTime() + ONE_YEAR).toGMTString();
      header["Cache-Control"] = "public, max-age=" + ONE_YEAR;
    }
    
    while (image_requests[fileName].length > 0) {
      (function(r) {
        r.writeHead(200, header);

        fs.createReadStream(fileName)
          .addListener('data', function(data){
            r.write(data, 'binary');
          })
          .addListener('end', function(){
            r.end();
          });
      })(image_requests[fileName].pop());
    }
  }
  
  function send404(fileName) {
    console.log("sending 404 for " + fileName);
    while (image_requests[fileName].length > 0) {
      var r = image_requests[fileName].pop();
      r.writeHead(404);
      r.end("NOT FOUND!");
    }
    
    // and cleanup
    try {
      console.log('unlink');
      fs.unlinkSync(baseFileName);
    } catch(err) { console.log('unlink fail', err); }
  }
  
  function resizeImage(from, to, options, successCallback, failureCallback) {
    magick
      .createCommand(from)
      .resizeMagick(options.width, options.height, options.extent)
      .write(to, function() {
        sys.puts("Done resizing.");
        successCallback(to);
      }, function() {
        console.log("Failed resizing, maybe not an image?");
        failureCallback(to);
      });
  }
  
  // params = {"url": "http://www.google.com/images/logos/ps_logo2.png", "width": 100, "height": 100};
  var url           = params.url,
      parsedUrl     = parseUrl(url, true),
      cookie        = '',
      fileName      = resultingFileName(params),
      baseFileName  = resultingFileName(params, true);
  
  // handle concurrency
  if (image_requests[fileName] && image_requests[fileName].length > 0) {
    image_requests[fileName].push(response);
    return;
  }
  
  image_requests[fileName] = [response];
  
  // handle local requests
  if ((parsedUrl.host || "").replace(/:.*/, '') == headers.host.replace(/:.*/, '') || headers.host.replace(/:.*/, '') == "127.0.0.1") {
    cookie = headers.cookie; // only send cookie if its a local request
  }
  
  console.log("check whether file exists: " + fileName);
  // image exists with correct size
  path.exists(fileName, function(exists){
    console.log("exists? " + exists);
    if (exists) {
      sendImage(fileName);
    } else {
      sys.puts("file doesn't exists");
      path.exists(baseFileName, function(exists) {
        // if the base file exists
        if (exists) {
          console.log("base file exists :) " + baseFileName);
          resizeImage(baseFileName, fileName, { height: params.height, width: params.width, extent: params.extent === "true" }, sendImage, send404);
        } else {
          sys.puts("NO base file exists :(");
          // get the port
          var secure = false;
          if (!parsedUrl.port) {
            if (parsedUrl.protocol == 'https:') {
              parsedUrl.port = 443;
              secure = true;
            } else {
              parsedUrl.port = 80;
            }
          }
          
          // request the image
          var fileStream = fs.createWriteStream(baseFileName);
          
          request({ uri: url, headers: { Cookie: cookie }, responseBodyStream: fileStream }, function (error, response, body) {
            fileStream.end();
            
            if (!error && response.statusCode == 200) {
              resizeImage(baseFileName, fileName, { height: params.height, width: params.width, extent: params.extent === "true" }, sendImage, send404);
            } else {
              console.log("Error for", url, error);
              send404(fileName);
            }
          });
        }
      });
    }
  });
};
