//= require "../../../controls/inline_autocompleter.js"
//= require "../../../utils/emojify.js"
//= require "../../../ui/context_menu.js"

/**
 * Auto completion for smileys and dropdown in UI
 * {code}, {quote}, ...
 */
protonet.timeline.Form.extensions.Smileys = function(input) {
  var emojis = [], contextMenuOptions = {};
  
  protonet.utils.emojify.shortcuts.replace(/\w+/g, function(match) {
    match = ":" + match + ":";
    emojis.push(match);
    contextMenuOptions[protonet.utils.emojify(match)] = function(target, close) {
      protonet.trigger("form.insert", match);
      close();
    };
  });
  
  new protonet.controls.InlineAutocompleter(
    input, emojis
  );
  
  new protonet.ui.ContextMenu(
    "#message-form [data-extension=smiley]",
    contextMenuOptions,
    "context-menu-smileys"
  );
};