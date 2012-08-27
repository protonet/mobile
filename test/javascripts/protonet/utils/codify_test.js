module("protonet.utils.codify");

test("Basic", function() {
  ok(protonet.utils.codify("here: {code}echo(1){/code}").match(/here\:\s*<pre>.*echo.*<\/pre>/));
  ok(protonet.utils.codify("here: [code]echo(1)[code]").match(/here\:\s*<pre>.*echo.*<\/pre>/));
});