protonet.utils.Behaviors.add({
  "input[type=text], input[type=password][title], textarea[title]": function(input) {
    new protonet.utils.InlineHint(input, input.attr("title"));
  }
});