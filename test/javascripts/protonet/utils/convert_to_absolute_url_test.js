module("protonet.utils.convertToAbsoluteUrl");

test("Basic", function() {
  equal(protonet.utils.convertToAbsoluteUrl("foobar.html", "http://google.com"), "http://google.com/foobar.html");
  equal(protonet.utils.convertToAbsoluteUrl("foobar.html", "http://google.com?123"), "http://google.com/foobar.html");
  equal(protonet.utils.convertToAbsoluteUrl("foobar.html", "http://google.com/foobaz.html?123"), "http://google.com/foobar.html");
  equal(protonet.utils.convertToAbsoluteUrl("//spiegel.de", "https://google.com/"), "https://spiegel.de");
});