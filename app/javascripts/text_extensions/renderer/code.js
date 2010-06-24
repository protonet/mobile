//= require "../../utils/escape_html.js"
//= require "../../utils/prettify_diff.js"
//= require "../../lib/google_code_prettify.js"

protonet.text_extensions.render.code = function(data, hide) {
  var container = $("<div />", {
    className: data.codeClass
  });
  
  var strong = $("<strong />", {
    html: data.codeTitle
  }).appendTo(container);
  
  var link = $("<a />", {
    href: data.codeLink || data.url,
    target: "_blank",
    html: hide ? "(show)" : "(hide)"
  }).appendTo(strong);
  
  if (data.code) {
    var pre = $("<pre />", {
      html: prettyPrintOne(protonet.utils.escapeHtml(data.code))
    }).appendTo(container);
    
    hide && pre.hide();
    
    link.click(function(event) {
      event.preventDefault();
      pre.toggle();
      link.html(pre.is(":visible") ? "(hide)" : "(show)");
    });
  }
  return container;
};