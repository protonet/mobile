var http      = require("http"),
    parseUrl  = require("url").parse,
    sys       = require("sys"),
    magick    = require('./../modules/node-magick'),
    path      = require('path'),
    fs        = require("fs"),
    md5       = require("./../modules/md5").create,
    child     = require('child_process'),
    request   = require('./../modules/node-utils/request'),
    image_requests = {};


exports.proxy = function(params, headers, response) {
  function resultingfileName(params, base) {
    var baseString = process.cwd() + "/public/externals/image_proxy/" + md5(params.url);
    if(base) {
      return(baseString);
    }
    if(params.width && params.height) {
      baseString += "_" + params.width + "_" + params.height;
    }
    return(baseString);
  }
  
  function sendImage(fileName) {
    console.log("sending: " + fileName)
    // once done send all
    child.exec("file --mime -b " + fileName, function(error, stdout, stderr) {
      var header = {};
      if (stdout && stdout.match(/(.*);/)) {
        header = { "Content-Type": stdout.match(/(.*);/)[1], "Content-Length": fs.lstatSync(fileName).size };
      } else {
        header = { "Content-Length": fs.lstatSync(fileName).size };
      }
      
      // Caching header
      var ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
      header["Expires"] = new Date(new Date().getTime() + ONE_YEAR).toGMTString();
      header["Cache-Control"] = "public, max-age=" + ONE_YEAR;
      
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
    });
  }
  
  function send404(fileName) {
    console.log("sending 404 for " + fileName);
    while (image_requests[fileName].length > 0) {
      var r = image_requests[fileName].pop();
      r.writeHead(404);
      r.end("NOT FOUND!");
    };
    // and cleanup
    try {
      console.log('unlink');
      fs.unlinkSync(baseFileName);
    } catch(err) { console.log('unlink fail', err); };
  };
  
  function resizeImage(from, to, size, successCallback, failureCallback) {
    try {
      var fileSize = fs.lstatSync(from).size;
    } catch(err) {
      var fileSize = 0;
    }
    if(fileSize > 0) {
      if(size.height && size.width) {
        magick
          .createCommand(from)
          .resizeMagick(size.width, size.height, parsedUrl.pathname.indexOf(".gif") === -1)
          .write(to, function() {
            sys.puts("Done resizing.");
            successCallback(to);
          }, function() {
            sys.puts("Failed resizing, maybe not an image?");
            failureCallback(to);
          });
      } else {
        successCallback(from);
      }
    } else {
      failureCallback(to);
    }
  }
  
  // params = {"url": "http://www.google.com/images/logos/ps_logo2.png", "width": 100, "height": 100};
  var url           = params.url,
      parsedUrl     = parseUrl(url, true),
      cookie        = '',
      fileName      = resultingfileName(params),
      baseFileName  = resultingfileName(params, true);
  
  // handle concurrency
  if (image_requests[fileName] && image_requests[fileName].length > 0){
    image_requests[fileName].push(response);
    return;
  } else {
    image_requests[fileName] = [response];
  }
  
  // handle local requests
  if ((parsedUrl.host || "").replace(/:.*/, '') == headers.host.replace(/:.*/, '') || headers.host.replace(/:.*/, '') == "127.0.0.1") {
    cookie = headers.cookie; // only send cookie if its a local request
  }
  
  console.log("check whether file exists: " + fileName);
  // image exists with correct size
  path.exists(fileName, function(exists){
    console.log("exists? " + exists);
    if (exists) {
      sys.puts("file exists " + fileName);
      sendImage(fileName);
    } else {
      sys.puts("file doesn't exists");
      path.exists(baseFileName, function(exists) {
        // if the base file exists
        if (exists) {
          sys.puts("base file exists :) " + baseFileName);
          //only apply size manipulation and then send
          resizeImage(baseFileName, fileName, {'height': params['height'], 'width': params['width']}, sendImage, send404);
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
              resizeImage(baseFileName, fileName, { height: params.height, width: params.width }, sendImage, send404);
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
