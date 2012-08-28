module("protonet.utils.formatSeconds");

test("Basic", function() {
  equal(protonet.utils.formatSeconds(100), "01:40");
  equal(protonet.utils.formatSeconds(1), "00:01");
});