//= require "../timeline/form/form.js"
//= require "../timeline/channels.js"
//= require "../platforms/fluid.js"
//= require "../platforms/prism.js"
//= require "../ui/users/widget.js"
//= require "../ui/files/widget.js"

//---------------------------- INITIALIZE INSTRUMENTS ----------------------------
protonet.p("instruments", function($page) {
  protonet.timeline.Form.initialize();
  protonet.timeline.Channels.initialize();
  
  protonet.ui.files.Widget.initialize();
  protonet.ui.users.Widget.initialize();
  
  var $aside = $("aside.side-content");
  
  function resizePage() {
    $page.css("min-height", Math.max($window.height() - $page.offset().top - 1, $aside.outerHeight() + 140).px());
  }
  
  $window.on("resize", resizePage);
  
  resizePage();
  
  // There's a captive portal redirect request and the user is logged in
  if (protonet.config.captive_redirect_url) {
    if (protonet.config.captive_redirect_only || !protonet.config.user_is_stranger) {
      var htmlEscapedUrl = protonet.utils.escapeHtml(protonet.config.captive_redirect_url),
          urlEncodedUrl  = encodeURIComponent(protonet.config.captive_redirect_url);
      new protonet.ui.Dialog({
        "class":  "dialog small",
        headline: protonet.t("instruments.headline_captive_portal", { user_name: protonet.config.user_name }),
        content:  protonet.t("instruments.text_captive_portal", { url: htmlEscapedUrl.truncate(40), href: "/captive/login?captive_redirect_url=" + urlEncodedUrl })
      });
    }
  }
});