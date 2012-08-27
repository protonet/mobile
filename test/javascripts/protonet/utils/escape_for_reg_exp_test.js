module("protonet.utils.escapeForRegExp");

test("Basic", function() {
  equal(protonet.utils.escapeForRegExp(".{1,2}[a-z]+"), "\\.\\{1,2\\}\\[a-z\\]\\+");
});