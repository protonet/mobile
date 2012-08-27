module("protonet.utils.addSlashes");

test("Basic", function() {
  equal(protonet.utils.addSlashes("Georg's a retard"), "Georg\\'s a retard");
  equal(protonet.utils.addSlashes('\\"'), '\\\\\\"');
});