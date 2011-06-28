var sys         = require("sys"),
    fs          = require("fs"),
    PUBLIC_DIR  = "./public";

exports.save = function(request, response) {
  var path  = "/externals/snapshots/snapshot_" + new Date().getTime() + ".jpg",
      image = fs.createWriteStream(PUBLIC_DIR + path);
  request.on("data", function(chunk) {
    image.write(chunk);
  });
  
  request.on("end", function() {
    image.end();
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end(path);
  });
};