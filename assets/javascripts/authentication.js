//= require 'lib/simple-javascript-airbrake-notifier/notifier.min.js'
//= require 'lib/mobile-bookmark-bubble/bookmark_bubble.js'
//= require_self


$.mobile.initializePage();
var $document = $(document);
$document.ready(function(){

  var bookmarkBubble = new google.bookmarkbubble.Bubble();

  // overwrite some functions to get it work. 
  // You can add a parametere here if you want to know
  // if the user instaled the app on the homescreen
  bookmarkBubble.hasHashParameter = function() {};
  bookmarkBubble.setHashParameter = function() {};
  
  bookmarkBubble.showIfAllowed();

  $document
    .ajaxStart(function(){
      $.mobile.showPageLoadingMsg();
      $('span.error').remove();
    })
    .ajaxComplete(function(){
      $.mobile.hidePageLoadingMsg();
    })
    .ajaxSuccess(function(event, request, options, data){
      if (data.redirect) {
        window.location.href = data.redirect;
      };
    })

    .delegate('#sign_up form', 'submit', function(event){
      event.preventDefault();
      var $this = $(this);

      $.ajax({
        url: $this.attr("action"),
        type: "post",
        data: $this.serializeArray(),
        cache: false,
        success: function(data){
          if (data["errors"]["login"]){
            var $span = $('<span class="error">')
                          .append(data["errors"]["login"][0]);

            if ($('#user_last_name').val().length) {
              $span.appendTo('label[for=user_last_name]');
            }else{
              $span.appendTo('label[for=user_first_name]')
            }
          }
          if (data["errors"]["email"]) {
            $('<span class="error">')
              .append(data["errors"]["email"][0])
              .appendTo("label[for=user_email]");
          }
          if (data["errors"]["password"]) {
            $('<span class="error">')
              .append(data["errors"]["password"][0])
              .appendTo("label[for=user_password]");
          }
        }
      });
    })

    .delegate('#sign_in form#login_form', 'submit', function(event){
      
      var $this = $(event.target);
      
      $.ajax({
        url: $this.attr("action"),
        type: "post",
        data: $this.serializeArray(),
        error: function(xhr, textStatus, errorThrown){
          $('<span class="error">')
            .empty()
            .append("Your credentials are invalid")
            .appendTo("label[for=user_password]");
        }
      });
      event.preventDefault();
    })

    .delegate('#reset_password form', 'submit', function(event){
      event.preventDefault();

      var $this = $(this);

      $.ajax({
        url: $this.attr("action"),
        type: "post",
        data: $this.serializeArray(),
        success: function(data){
          if (data.success === true) {
            setTimeout(function(){
              $.mobile.showPageLoadingMsg("e", data["message"], true);
              setTimeout(function(){
                $.mobile.hidePageLoadingMsg();
              }, 5000);
            }, 0);
          }else{
            $('<span class="error">')
              .append(data["message"])
              .appendTo("label[for=user_email]")
          }
        }
      });
    })

    .delegate('#edit_password form', 'submit', function(event){
      var $this = $(this),
          password = $this.find("#user_password").val(),
          password_confirmation = $this.find("#user_password_confirmation").val();

      event.preventDefault();

      if (password.length < 8) {
        $.mobile.showPageLoadingMsg("e", "password is too short", true);
        setTimeout(function(){
          $.mobile.hidePageLoadingMsg();
        }, 2000);
        return;
      };
      if (password != password_confirmation) {
        $.mobile.showPageLoadingMsg("e", "password and confirmation does not match!", true);
        setTimeout(function(){
          $.mobile.hidePageLoadingMsg();
        }, 2000);
        return;
      };

      $.ajax({
        url: $this.attr("action"),
        type: "post",
        data: $this.serializeArray(),
        success: function(data){
          if (data.message) {
            setTimeout(function(){
              $.mobile.showPageLoadingMsg("e", data["message"], true);
              setTimeout(function(){
                $.mobile.hidePageLoadingMsg();
              }, 5000);
            }, 0);
          }
        }
      });

    });

});
