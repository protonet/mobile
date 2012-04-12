require('./modules/underscore');
var util  = require('util'),
    fs    = require('fs'),
    exec  = require('child_process').exec,
    Step  = require('./modules/step');
    
var read1 = function(callback) {
  fs.readFile("/tmp/foo1", callback);
}

var read2 = function(callback) {
  fs.readFile("/tmp/bar1", callback);
}

Step(
  // Loads two files in parallel
  function loadStuff() {
    read2(this.parallel());
    read1(this.parallel());
  },
  // Show the result when done
  function showStuff(err, code, users) {
    if (err) throw err;
    console.log(code.toString());
    console.log(users.toString());
  }
)

