//= require "../timeline/form/form.js"
//= require "../timeline/channels.js"
//= require "../platforms/fluid.js"
//= require "../platforms/prism.js"
//= require "../ui/click_to_flash_teaser.js"
//= require "../ui/overlay.js"

//---------------------------- INITIALIZE INSTRUMENTS ----------------------------
protonet.p("instruments", function($page) {
  protonet.timeline.Form.initialize();
  protonet.timeline.Channels.initialize();
  
  $page.css("min-height", $("aside.side-content").outerHeight().px());
  
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