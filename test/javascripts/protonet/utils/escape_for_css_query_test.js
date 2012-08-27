module("protonet.utils.escapeForCssQuery");

test("Basic", function() {
  equal(protonet.utils.escapeForCssQuery("'foo'"), "\\'foo\\'");
  equal(protonet.utils.escapeForCssQuery('"foo"'), '\\"foo\\"');
});