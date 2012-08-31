$(document).delegate('form#login_form', 'submit', function(event){
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
      if (data["success"]) {
        location.href = "/";
      }else{
        var $popup = $("<div>",{
          "class": "ui-content ui-popup ui-body-e ui-overlay-shadow ui-corner-all",
          "style": "background: rgba(255,125,125,.6)",
          html: data["message"]
        }).popup();
        $popup.popup("open");
      }
    },
    error: function(){
      console.log(arguments);
    },
    complete: function(){
      $.mobile.hidePageLoadingMsg();
    }
  });
  
});
