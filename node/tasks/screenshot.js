exec = require("child_process").exec;

// TODO: uhm, if I could use an hash tag here, I would use #BigFuckingSecurityHole
exports.make = function(url, callback) {
  exec("./../webkit2png/webkit2png-0.5.sh -d -D node/screenshots " + url, function (error, stdout, stderr) {
    sys.print("stdout: " + stdout);
    sys.print("stderr: " + stderr);
    
    if (!error) {
      sys.puts("exec error: " + error);
    }
    
    callback(stdout);
  });
};
