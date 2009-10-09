//= require "lib/jquery-1.3.2.min.js"
//= require "lib/jquery.hotkeys-0.7.9.min.js"

// make sure app works even without firebug
if(!window.console) {
	var console = {"log": function(){}};
}


// protonet namespace
var protonet = protonet || {};
protonet.controls = protonet.controls || {};
protonet.utils = protonet.utils || {};


// Function binding - Taken from http://snipplr.com/view.php?codeview&id=13987
Function.prototype.bind = function () {
  if (arguments.length < 2 && arguments[0] === undefined) {
    return this;
  }
  var thisObj = this,
      args = Array.prototype.slice.call(arguments),
      obj = args.shift();
  return function () {
    return thisObj.apply(obj, args.concat(Array.prototype.slice.call(arguments)));
  };
};

//= require "navigation.js"
//= require "utils/inline_hint.js"

// add inline hints
$(function() {
  $("input:text[title], input:password[title], textarea[title]").each(function() {
    var input = $(this);
    new protonet.utils.InlineHint(input, input.attr("title"));
  });
});