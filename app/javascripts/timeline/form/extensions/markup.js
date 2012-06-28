/**
 * Auto completion for markup tags
 * {code}, {quote}, ...
 */
protonet.timeline.Form.extensions.Markup = function(input) {
  var REG_EXP = /((\{|\[)[a-z]+(\}|\]))\s*$/i;
  
  function onAutocomplete() {
    var value           = input.val(),
        selectionEnd    = input.prop("selectionEnd"),
        beforeCaret     = value.substring(0, selectionEnd),
        match           = beforeCaret.match(REG_EXP) || [],
        openingTag      = match[1];
    if (openingTag) {
      var closingTag   = match[2] + "/" + openingTag.substring(1); // "{code}" becomes "{/code}"
      input
        .val(value.substring(0, selectionEnd) + closingTag + value.substring(selectionEnd))
        .prop("selectionStart", selectionEnd)
        .prop("selectionEnd", selectionEnd);
    }
  }
  
  new protonet.ui.InlineAutocompleter(input, [
    "quote}", "/quote}", "code}", "/code}", "text}", "/text}"
  ], {
    fromBeginning:  false,
    append:         "",
    whiteSpace:     ["{"],
    onAutocomplete: onAutocomplete
  });
  
  new protonet.ui.InlineAutocompleter(input, [
    "code]", "/code]", "quote]", "/quote]", "text]", "/text]"
  ], {
    fromBeginning: false,
    append:         "",
    whiteSpace:     ["["],
    onAutocomplete: onAutocomplete
  });
};