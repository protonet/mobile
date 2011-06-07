protonet.utils.Behaviors.add({
  "input[type=text], input[type=password][title], textarea[title]": function(input) {
    new protonet.utils.InlineHint(input, input.attr("title"));
  },
  
  "a[data-lightbox]:click": function(link, event) {
    var headline = link.data("lightbox-title");
    $.get(link.attr("href"), function(response) {
      new protonet.ui.ModalWindow("my-modal-window").content(response).headline(headline).show();
    });
    event.preventDefault();
  },
  
  // this behaviour is the first ajax form behaviour we're using
  // we've bound it's implementation to the invitation form usage
  "form[data-protonet-remote]:submit": function(form, event) {
    $.ajax({
      type: form.attr("method"),
      url:  form.attr("action"),
      data: form.serialize(),
      beforeSend: function(){
        form.find("input,textarea,select").attr("disabled", "disabled");
      },
      success:function(response) {
        if (protonet.ui.currentModalWindow) {
          protonet.ui.currentModalWindow.hide();
        }
        protonet.Notifications.trigger("flash_message.notice", response.flash);
      },
      error: function(response) {
        protonet.ui.currentModalWindow.update({ content: response.responseText });
      }
    });
    event.preventDefault();
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