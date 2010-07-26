var sys           = require("sys"),
    spawn         = require("child_process").spawn,
    md5           = require("./../modules/md5").create,
    TEMPLATE_DIR  = "./public/externals/screenshots/{hash}.png";

exports.make = function(params, response) {
  sys.puts("makes screenshot of " +  sys.inspect(params));
  var output  = TEMPLATE_DIR.replace("{hash}", md5(params.url)),
      command = spawn("ls", ["asdasd"]);
  command.addListener("exit", function(code) {
    sys.puts("exit received:" + code);
    
    response.writeHead(301, {
      "Content-Length": 0,
      "Location":       output
    });
    response.end();
  });
};
