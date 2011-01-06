var sys           = require("sys"),
    spawn         = require("child_process").spawn,
    exec          = require('child_process').exec,
    path          = require('path'),
    md5           = require("./../modules/md5").create,
    fs            = require("fs"),
    TEMPLATE_DIR  = "./public/externals/",
    screenshot_requests = {};

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

  function sendScreenshot(fileName) {
    console.log('sending: ' + fileName);
    screenshot_requests[fileName].forEach(function (r) {
      r.writeHead(200, { 'Content-Type': 'image/png'});
      fs.createReadStream(fileName)
        .addListener('data', function(data){
          r.write(data, 'binary');
        })
        .addListener('end', function(){
          r.end();
        });
    });
  }
  
  function makeScreenshot(baseName, sanitizedUrl, callback) {
    var command = '';
    try
      {
        var stat = fs.lstatSync('/usr/local/bin/CutyCapt');
        if(stats.isFile()) {
          command = "xvfb-run --server-args=\"-screen 0, 1024x768x24\" CutyCapt --js-can-open-windows=off --url='" + sanitizedUrl + "' --out=" + fileName;
        }
      }
      catch (e)
      {
        command = "script/local_deps/webkit2png-0.5.sh --clipwidth=300 --clipheight=200 -C -o " + baseName + " -D " + directory + ' "' + sanitizedUrl + '"';
      }
    exec(command, 
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        } else {
          callback(fileName);
        }
      }
    );
  }
  
  // handle concurrency
  if(screenshot_requests[fileName]){
    screenshot_requests[fileName].push(response);
  } else {
    screenshot_requests[fileName] = [response];
  }
  
  makeScreenshot(baseName, sanitizedUrl, sendScreenshot);

};

