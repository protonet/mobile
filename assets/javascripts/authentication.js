$(document).ready(function(event){

  $(document).delegate('#start form', 'submit', function(event){
    event.preventDefault();
    var $this = $(this);
    $.ajax({
      url: $this.attr("action"),
      type: "post",
      data: $this.serializeArray(),
      beforeSend: function(){
        $.mobile.showPageLoadingMsg();
      },
      success: function(data){
        if (data["success"] === true ) {
          location.href = "/";
        }else{
          $.mobile.hidePageLoadingMsg();
          $.mobile.showPageLoadingMsg("e", data["message"], true);
          setTimeout(function(){
            $.mobile.hidePageLoadingMsg();
          }, 2000);
        }
      }
    });
    
  });

  $(document).delegate('#reset_password form', 'submit', function(event){
    event.preventDefault();

    var $this = $(this);

    $.ajax({
      url: $this.attr("action"),
      type: "post",
      data: $this.serializeArray(),
      beforeSend: function(){
        $.mobile.showPageLoadingMsg();
      },
      success: function(data){
        $.mobile.hidePageLoadingMsg();
        $.mobile.showPageLoadingMsg("e", data["message"], true);
        setTimeout(function(){
          $.mobile.hidePageLoadingMsg();
        }, 2000);
      }
    });

  });

  $(document).delegate('#edit_password form', 'submit', function(event){
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
