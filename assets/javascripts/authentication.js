var $document = $(document);
$document.ready(function(){

  $document
    .ajaxStart(function(){
      $.mobile.showPageLoadingMsg();
      $('span.error').remove();
    })
    .ajaxComplete(function(){
      $.mobile.hidePageLoadingMsg();
    })
    .ajaxSuccess(function(event, request, options, data){
      console.log("ajaxSuccess", arguments);

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

      console.log("submit");
      console.log($this);
      console.log($this.attr("action"));
      console.log($this.serializeArray())

      $.ajax({
        url: $this.attr("action"),
        type: "post",
        data: $this.serializeArray(),
        success: function(data){
          if (data["error"]) {
            $('<span class="error">')
              .append(data["error"])
              .appendTo("label[for=user_password]");
          }
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

      if (password.length < 8) {
        event.preventDefault();
        $.mobile.showPageLoadingMsg("e", "password is too short", true);
        setTimeout(function(){
          $.mobile.hidePageLoadingMsg();
        }, 2000);
      };
      if (password != password_confirmation) {
        event.preventDefault();
        $.mobile.showPageLoadingMsg("e", "password and confirmation does not match!", true);
        setTimeout(function(){
          $.mobile.hidePageLoadingMsg();
        }, 2000);
      };

    });

});
