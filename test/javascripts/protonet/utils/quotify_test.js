module("protonet.utils.quotify");

test("Basic", function() {
  ok(protonet.utils.quotify("here: {quote}foobar{/quote}").match(/here\:\s*<q>foobar<\/q>/));
  ok(protonet.utils.quotify("here: [quote]foobar[quote]").match(/here\:\s*<q>foobar<\/q>/));
});