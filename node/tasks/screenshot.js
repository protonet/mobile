var sys           = require("sys"),
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

console.log("Screenshot subsystem determines a " + systemType + " system.")


exports.make_and_publish = function(url, publish) {
  path.exists(TEMPLATE_DIR + md5(url) + "-clipped.png", function(exists){
    if(exists) {
      sys.puts("found screenshot for " + sys.inspect(url));
      publish({"screenshot":"/externals/" + md5(url) + "-clipped.png"}, "screenshot");
    } else {
      sys.puts("making screenshot of " +  sys.inspect(url));
      // DANGER TODO FIXME -> escape url or sanitize it
      exec("script/local_deps/webkit2png-0.5.sh --clipwidth=300 --clipheight=200 -C -o " + md5(url) + " -D public/externals " + url, 
        function (error, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
          } else {
            publish({"screenshot":"/externals/" + md5(url) + "-clipped.png"}, "screenshot");
          }
        }
      );
    }
  });
};

exports.make_and_send = function(url, response) {
  sys.puts("making screenshot of " +  sys.inspect(url));
  var baseName      = md5(url),
      directory     = "public/externals/screenshots",
      fileName      = process.cwd() + "/" + directory + "/" + baseName + "-clipped.png",
      // DANGER TODO FIXME -> escape url or sanitize it
      sanitizedUrl  = url.replace('"', '');


  function screenshotCommand(sanitizedUrl, fileName, baseName, directory) {
    if(systemType == 'linux') {
      command = "xvfb-run -a --server-args=\"-screen 0, 1024x768x24\" script/local_deps/webkit2png.py --aspect-ratio crop --scale 300 200 '" + sanitizedUrl + "' -o " + fileName;
    } else {
      command = "script/local_deps/webkit2png-0.5.sh --clipwidth=300 --clipheight=200 -C -o " + baseName + " -D " + directory + ' "' + sanitizedUrl + '"';
    }
    return command;
  }
  
  function writeDefaultImage(sanitizedUrl, fileName, callback) {
    console.log('writing default image for ' + sanitizedUrl + ' fileName: ' + fileName);
    // write default image!
    exec("cp " + process.cwd() + "/public/images/world-globe-small.jpg " + fileName, function(error, stdout, stderr) {
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
          var r = screenshotRequests[fileName].pop();
          r.writeHead(200, { 'Content-Type': 'image/png'});
          fs.createReadStream(fileName)
            .addListener('data', function(data){
              r.write(data, 'binary');
            })
            .addListener('end', function(){
              r.end();
            });
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
          writeDefaultImage(sanitizedUrl, fileName, sendScreenshot)
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

