var sys = require("sys");
var net = require("net");
var fs  = require("fs");
var http = require('http');
var querystring = require('querystring');
exec  = require('child_process').exec;

fs.watchFile('/home/betahaus-scanner/scans', function (curr, prev) {
  console.log('changed file is: ' + sys.inspect(curr));

  child = exec('mv /home/betahaus-scanner/scans/* /home/protonet/dashboard/shared/user-files/9', 
    function (error, stdout, stderr) {
      sys.print('stdout: ' + stdout);
      sys.print('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      } else {
        exec('chown protonet:protonet -R /home/protonet/dashboard/shared/user-files/9');
        exec('chmod g+r -R /home/protonet/dashboard/shared/user-files/9');
        setTimeout(function(){
          var localNode = http.createClient(80, 'localhost');
          var username = 'scanner';
          var password = 'scanner$01';
          var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
          var header = {'Host': 'localhost', 'Authorization': auth};
          var request = localNode.request('POST', '/meeps', header);
          request.write(querystring.stringify({"channel_id":9, "meep": {"message": "your scan has arrived, please reload the file browser"}}));
          request.end();
        }, 15000)
      }
  });
});
