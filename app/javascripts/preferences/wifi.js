protonet.preferences.Wifi = function() {
  $("input:text[title], input:password[title], textarea[title]").each(function() {
    var input = $(this);
    new protonet.utils.InlineHint(input, input.attr("title"));
  });
};

protonet.preferences.Wifi.prototype = {
}