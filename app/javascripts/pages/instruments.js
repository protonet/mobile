//= require "../timeline/form/form.js"
//= require "../timeline/channels.js"
//= require "../platforms/fluid.js"
//= require "../platforms/prism.js"
//= require "../ui/overlay.js"
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
  
  // there's a captive portal redirect request and the user is logged in
  if (protonet.config.captive_redirect_url) {
    if (protonet.config.captive_redirect_only || !protonet.config.user_is_stranger) {
      var htmlEscapedUrl = protonet.utils.escapeHtml(protonet.config.captive_redirect_url),
          urlEncodedUrl  = encodeURIComponent(protonet.config.captive_redirect_url);
      new protonet.ui.Overlay(
        "<h4>Hi " + protonet.config.user_name + ",</h4>" +
        "<br>Welcome to protonet. Click the following button to enable internet access and to open " +
        "<strong>" + htmlEscapedUrl.truncate(40) + "</strong>.<br>" +
        '<a class="button close" data-avoid-ajax="1" href="/captive/login?captive_redirect_url=' + urlEncodedUrl + '" target="_blank">' +
        'Get internet access</a>'
      );
    }
  }
});