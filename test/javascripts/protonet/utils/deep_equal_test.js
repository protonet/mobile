module("protonet.utils.deepEqual");

test("Basic", function() {
  ok(protonet.utils.deepEqual({ a: 1, b: ["a", "b"], c: true }, { c: true, a: 1, b: ["a", "b"] }));
});