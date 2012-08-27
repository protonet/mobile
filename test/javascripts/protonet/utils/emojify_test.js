module("protonet.utils.emojify");

test("Basic", function() {
  equal(protonet.utils.emojify("hehe :laugh:"), 'hehe <span class="emoji emoji-laugh" title=":laugh:">:laugh:</span>');
  equal(protonet.utils.emojify("hehe :foobar:"), "hehe :foobar:");
});