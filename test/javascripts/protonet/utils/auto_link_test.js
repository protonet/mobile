module("protonet.utils.autoLink");

test("Basic", function() {
  equal(protonet.utils.autoLink("www.googoo.com"), '<a href="http://www.googoo.com" target="_blank">www.googoo.com</a>');
  equal(protonet.utils.autoLink("check spellboy (www.spellboy.com/)"), 'check spellboy (<a href="http://www.spellboy.com/" target="_blank">www.spellboy.com/</a>)');
  equal(protonet.utils.autoLink("www..."), 'www...');
  equal(protonet.utils.autoLink("You should go to http://penisenlarger.com."), 'You should go to <a href="http://penisenlarger.com" target="_blank">http://penisenlarger.com</a>.');
  equal(protonet.utils.autoLink("http://protonet.info/abcdefghijklmnopqrstuvwxyz"), '<a href="http://protonet.info/abcdefghijklmnopqrstuvwxyz" target="_blank">http://protonet.info/abcdefghijklmnop...</a>');
});