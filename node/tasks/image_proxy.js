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
    var base = base || false;
    var baseString = process.cwd() + "/public/externals/image_proxy/" + md5(params.url);
    if(base) {
      return(baseString);
    }
    if(params.width && params.height) {
      baseString = baseString + "_" + params.width + "_" + params.height;
    }
    return(baseString);
  }
  
  function sendImage(fileName) {
    console.log("sending: " + fileName)
    // once done send all
    child.exec("file --mime -b " + fileName, function(error, stdout, stderr) {
      var header = {};
      if(stdout && stdout.match(/(.*);/)) {
        header = {'Content-Type': stdout.match(/(.*);/)[1], 'Content-Length': fs.lstatSync(fileName).size};
      } else {
        header = {'Content-Length': fs.lstatSync(fileName).size};
      }
      while (image_requests[fileName].length > 0) {
        var r = image_requests[fileName].pop();
        r.writeHead(200, header);
        fs.createReadStream(fileName).pipe(r);
      };
    });
  }
  
  function send404(fileName) {
    console.log("sending 404 for " + fileName);
    while (image_requests[fileName].length > 0) {
      var r = image_requests[fileName].pop();
      r.writeHead(404);
      r.end("NOT FOUND!");
    };
  };
  
  function resizeImage(from, to, size, successCallback, failureCallback) {
    if(fs.lstatSync(from).size > 0) {
      if(size["height"] && size["width"]) {
        magick
          .createCommand(from)
          .resizeMagick(size["width"], size["height"])
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
  var url       = params.url,
      parsedUrl = parseUrl(url, true),
      urlPath   = (parsedUrl.pathname || "/") + (parsedUrl.search || ""),
      cookie    = '';

  var fileName      = resultingfileName(params);
  var baseFileName  = resultingfileName(params, true);
  
  // handle concurrency
  if(image_requests[fileName] && image_requests[fileName].length > 0){
    console.log("concurrent")
    image_requests[fileName].push(response);
    return;
  } else {
    console.log("new")
    image_requests[fileName] = [response];
  }
  
  // handle local requests
  if(parsedUrl.host.replace(/:.*/, '') == headers.host.replace(/:.*/, '')) {
    cookie             = headers.cookie; // only send cookie if its a local request
  }

  // image exists with correct size
  path.exists(fileName, function(exists){
    if(exists) {
      sys.puts("file exists " + fileName);
      sendImage(fileName);
    } 
    else {
      sys.puts("file doesn't exists");
      path.exists(baseFileName, function(exists) {
        // if the base file exists
        if(exists) {
          sys.puts("base file exists :)");
          //only apply size manipulation and then send
          resizeImage(baseFileName, fileName, {'height': params['height'], 'width': params['width']}, sendImage, send404);
        }
        else {
          sys.puts("NO base file exists :(");
          
          var fileStream = fs.createWriteStream(baseFileName);
          r = request({"uri": url, "maxSockets": 20, "headers": {"Cookie": cookie}}, function(error, response, body) {
            console.log("opening: " + url)
            if(response.statusCode == 200) {
              fileStream.on("close", function(){
                resizeImage(baseFileName, fileName, {'height': params['height'], 'width': params['width']}, sendImage, send404);
              });
            } else {
              console.log(url + ' returned a ', response.statusCode);
              fileStream.on("drain", function(){
                fs.unlinkSync(baseFileName);
              });
              send404(fileName);
            }
          });
          r.pipe(fileStream);
        }
      });
    }
  });
};