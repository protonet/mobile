protonet.text_extensions.render.code = function(data, hide) {
  var container = $("<div>", {
    "class": data.codeClass
  });
  
  var strong = $("<strong>", {
    html: data.codeTitle
  }).appendTo(container);
  
  var link = $("<a>", {
    href: data.codeLink || data.url,
    target: "_blank",
    html: protonet.t(hide ? "link_show" : "link_hide")
  }).appendTo(strong);
  
  if (data.code) {
    var pre = $("<pre>", {
      html: protonet.utils.prettifyCode(protonet.utils.escapeHtml(data.code))
    }).appendTo(container);
    
    hide && pre.hide();
    
    link.click(function(event) {
      event.preventDefault();
      pre.toggle();
      link.html(protonet.t(pre.is(":visible") ? "link_hide" : "link_show"));
    });
  }
  return container;
};