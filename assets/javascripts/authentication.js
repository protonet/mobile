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
      if (data["success"] === true ) {
        location.href = "/";
      }else{
        var $popup = $("<div>",{
          "data-role": "popup",
          "style": "background: rgba(255,125,125,.6)",
          html: data["message"]
        }).page();
        $popup.popup();
        $popup.popup("open");
      }
    },
    error: function(){
      console.log(arguments);
    },
    complete: function(){
      console.log("complete")
      $.mobile.hidePageLoadingMsg();
    }
  });
  
});
