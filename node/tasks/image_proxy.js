var http      = require("http"),
    parseUrl  = require("url").parse,
    sys       = require("sys"),
    magick    = require('./../modules/node-magick.js'),
    path      = require('path'),
    fs        = require("fs"),
    md5       = require("./../modules/md5").create,
    child     = require('child_process'),
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
    // once done send all
    image_requests[fileName].forEach(function (r) {
      child.exec("file --mime -b " + fileName, function(error, stdout, stderr) {
        if(stdout && stdout.match(/(.*);/)) {
          r.writeHead(200, {'Content-Type': stdout.match(/(.*);/)[1]})
        } else {
          r.writeHead(200)
        }
        fs.createReadStream(fileName)
          .addListener('data', function(data){
            r.write(data, 'binary');
          })
          .addListener('end', function(){
            r.end();
          });
      });
    });
  }
  
  function send404(fileName) {
    image_requests[fileName].forEach(function (r) {
      r.writeHead(404);
      r.end("NOT FOUND!");
    });
  }
  
  function resizeImage(from, to, size, callback) {
    if(size["height"] && size["width"]) {
      magick
        .createCommand(from)
        .resizeMagick(size["width"], size["height"])
        .write(to, function() {
          sys.puts("Done resizing.");
          callback(to);
        });
    } else {
      callback(from);
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
  if(image_requests[fileName]){
    image_requests[fileName].push(response);
  } else {
    image_requests[fileName] = [response];
  }
  
  // handle local requests
  if(parsedUrl.host.replace(/:.*/, '') == headers.host.replace(/:.*/, '')) {
    cookie             = headers.cookie; // only send cookie if its a local request
  }

  // image exists with correct size
  path.exists(fileName, function(exists){
    if(exists) {
      sys.puts("file exists")
      sendImage(fileName);
    } 
    else {
      sys.puts("file doesn't exists")
      path.exists(baseFileName, function(exists) {
        // if the base file exists
        if(exists) {
          sys.puts("base file exists :)")
          //only apply size manipulation and then send
          resizeImage(baseFileName, fileName, {'height': params['height'], 'width': params['width']}, sendImage);
        }
        else {
          sys.puts("NO base file exists :(")
          // get the port
          if(!parsedUrl.port) {
            parsedUrl.port = (parsedUrl.protocol == 'https:' ? 443 : 80)
          }
          
          // request the image
          var proxy   = http.createClient(parsedUrl.port, parsedUrl.hostname);
          var request = proxy.request("GET", urlPath, {
            "Host": parsedUrl.hostname,
            "Cookie": cookie
          });
          request.end();
          // handle errors
          proxy.addListener("error", function(error) {
            console.error("client error " + error.stack);
            send404(fileName);
          })
          // and get the response
          request.addListener("response", function(proxy_response) {
            sys.puts("http_proxy response received - status code: " + proxy_response.statusCode);
            if(proxy_response.statusCode != 200) {
              send404(fileName);
              return;
            }
            var fileStream = fs.createWriteStream(baseFileName);
            proxy_response.addListener("data", function(chunk) {
              fileStream.write(chunk, "binary");
            });
            proxy_response.addListener("end", function() {
              fileStream.addListener("drain", function() {
                // Close file stream
                fileStream.end();
                // response.writeHead(200, {'Content-Type': proxy_response["headers"]["content-type"]});
                resizeImage(baseFileName, fileName, {'height': params['height'], 'width': params['width']}, sendImage);
              });
            });
          });

        }
      });
    }
  });
};