var sys           = require("util"),
    spawn         = require("child_process").spawn,
    exec          = require('child_process').exec,
    path          = require('path'),
    md5           = require("./../modules/md5").create,
    fs            = require("fs"),
    TEMPLATE_DIR  = "./public/externals/",
    screenshotRequests = {},
    systemType = '';

// check for system type
try {
  var stat = fs.lstatSync('/etc/issue');
  systemType = "linux";
} catch (e) {
  systemType = "non-linux";
}

console.log("Screenshot subsystem determines a " + systemType + " system.");


exports.make_and_send = function(url, response) {
  sys.puts("making screenshot of " +  sys.inspect(url));
  var baseName      = md5(url),
      directory     = "public/externals/screenshots",
      fileName      = process.cwd() + "/" + directory + "/" + baseName + "-clipped.png",
      // DANGER TODO FIXME -> escape url or sanitize it
      sanitizedUrl  = url.replace(/["']/g, '');

  function screenshotCommand(sanitizedUrl, fileName, baseName, directory) {
    if(systemType == 'linux') {
      // This is using the following user agent
      // Mozilla/5.0 (X11; U; Linux; C -) AppleWebKit/532.4 (KHTML, like Gecko) Qt/4.6.2 Safari/532.4
      command = "xvfb-run -a --server-args=\"-screen 0, 1024x768x24\" script/local_deps/webkit2png.py --aspect-ratio crop --scale 300 200 '" + sanitizedUrl + "' -o " + fileName;
    } else {
      // This is using the following user agent
      // Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; de-de) AppleWebKit/533.18.1 (KHTML, like Gecko)
      command = "script/local_deps/webkit2png-0.5.sh --clipwidth=300 --clipheight=200 -C -o " + baseName + " -D " + directory + ' "' + sanitizedUrl + '"';
    }
    return command;
  }
  
  function writeDefaultImage(sanitizedUrl, fileName, callback) {
    console.log('writing default image for ' + sanitizedUrl + ' fileName: ' + fileName);
    // write default image!
    exec("cp " + process.cwd() + "/public/img/world-globe-small.jpg " + fileName, function(error, stdout, stderr) {
      if (error == null) {
        callback(fileName);
      }
    });
  }
  
  function send404() {
    while (screenshotRequests[fileName].length > 0) {
      var r = screenshotRequests[fileName].pop();
      r.writeHead(404);
      r.end("NOT FOUND!");
    }
  }
  
  function sendScreenshot(fileName) {
    try {
      if (fs.lstatSync(fileName).size > 0) {
        console.log('sending: ' + fileName);
        while (screenshotRequests[fileName].length > 0) {
          (function(r) {
            r.writeHead(200, { 'Content-Type': 'image/png'});
            fs.createReadStream(fileName)
              .addListener('data', function(data) {
                r.write(data, 'binary');
              })
              .addListener('end', function() {
                r.end();
              });
          })(screenshotRequests[fileName].pop());
        }
      } else {
        send404();
      }
    }
    catch (e) {
      send404();
    }
  }
  
  function makeScreenshot(baseName, sanitizedUrl) {
    var command = screenshotCommand(sanitizedUrl, fileName, baseName, directory);
    
    exec(command, 
      function (error, stdout, stderr) {
        console.log('command: ' + command);
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (stderr != "" || error !== null) {
          console.log('exec error: ' + error);
          writeDefaultImage(sanitizedUrl, fileName, sendScreenshot);
        } else {
          sendScreenshot(fileName);
        }
    });
  }
  
  // handle concurrency
  if(screenshotRequests[fileName] && screenshotRequests[fileName].length > 0){
    screenshotRequests[fileName].push(response);
    return;
  } else {
    screenshotRequests[fileName] = [response];
  }
  
  path.exists(fileName, function(exists) {
    if(exists) {
      sys.puts("screenshot file exists");
      sendScreenshot(fileName);
    } else {
      sys.puts("screenshot file does NOT exists");
      makeScreenshot(baseName, sanitizedUrl);
    }
  });

};

