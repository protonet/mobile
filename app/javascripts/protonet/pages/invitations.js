//= require "../../lib/wysihtml5/dist/wysihtml5-0.3.0_rc1.js"
$(function() {

  var wysihtml5ParserRules = {
    "classes":{
      "avatar": 1,
      "mail": 1,
      "footnote": 1
    },
    "tags": {
      strong: {},
      b:      {},
      h1:     {},
      h2:     {},
      i:      {},
      em:     {},
      br:     {},
      p:      {},
      div:    {},
      span:   {},
      ul:     {},
      ol:     {},
      li:     {},
      hr:     {},
      img: {
        "check_attributes": {
          "width": "numbers",
          "alt": "alt",
          "src": "url",
          "height": "numbers"
        }
      },
      a:{
        "check_attributes": {
          "href":   "url" // important to avoid XSS
        }
      }
    }
  };
  
  if ($('#invitation_message').length > 0) {
    var editor = new wysihtml5.Editor("invitation_message", {
      stylesheets:  "/stylesheets/wysihtml5.css",
      toolbar: "wysihtml5-toolbar",
      autoLink: true,
      parserRules: wysihtml5ParserRules
    });
  };
  
  $("#show-comparison-chart").on("click", function() {
    var $template = new protonet.utils.Template("user-roles-table-template").to$();
    new protonet.ui.Dialog({ content: $template, headline: protonet.t("users.headline_user_types") });
    return false;
  });
});