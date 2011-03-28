protonet.utils.Behaviors.add({
  "input[type=text], input[type=password][title], textarea[title]": function(input) {
    new protonet.utils.InlineHint(input, input.attr("title"));
  },
  
  "a[data-lightbox]:click": function(link, event) {
    event.preventDefault();
    var headline = link.data("lightbox-title") || "Hello my friend!";
    $.get(link.attr('href'), function(response){
      protonet.ui.ModalWindow.update({ "content": response, "headline": headline }).show({ className: "my-modal-window" });
    });
  },
  
  // this behaviour is the first ajax form behaviour we're using
  // we've bound it's implementation to the invitation form usage
  "form[data-protonet-remote]:submit": function(form, event) {
    event.preventDefault();
    $.ajax({
      "type": form.attr("method"),
      "url":  form.attr("action"),
      "data": form.serialize(),
      "beforeSend": function(){
        form.find("input,textarea,select").attr("disabled", "disabled");
      },
      "success":function(response, status){
        protonet.ui.ModalWindow.hide();
        protonet.Notifications.trigger("flash_message.notice", response.flash);
      },
      "error": function(response, status){
        protonet.ui.ModalWindow.update({ "content": response.responseText });
      }
    });
  }
});

if (protonet.user.Browser.IS_TOUCH_DEVICE()) {
  
  protonet.utils.Behaviors.add({
    "[tabindex]:touchstart": function(element, event) {
      if (element.is(":focus")) {
        event.stopImmediatePropagation();
      }
    },
    
    "[tabindex]:touchend": function(element) {
      if (element.is("a, input, select, textarea, :focus")) {
        return;
      }
      
      element.trigger("focus");
      $(document).one("touchstart", function() {
        element.trigger("blur");
      });
    }
  });
  
}