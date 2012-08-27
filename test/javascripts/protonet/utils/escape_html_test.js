module("protonet.utils.escapeHtml");

test("Basic", function() {
  equal(protonet.utils.escapeHtml('&<>"'), "&amp;&lt;&gt;&quot;");
});