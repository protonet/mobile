$(function() {
  $("#preferences ul li").click(function(event){
    $("#preferences-details").load("/preferences/" + event.currentTarget.id)
    $("#preferences ul li.clicked").toggleClass("clicked");
    $(this).toggleClass("clicked");
  });
  $("#profile").click();
});

/*function profileController() {
  $('foo').click
}*/

// TODO: place elsewhere
$.fn.serializeForm = function() {
  data = {};
  items = this.serializeArray();
  $.each(items,function(i,item) {
    data[item['name']] = item['value'];
  });
  return data;
}

// TODO: place elsewhere
function submitHook(form, callback) {
  $(form).submit(function(e) {
    items = {};
    items = $(form).serializeForm();
    url = $(form).attr('action');
    if(url == '') {
      alert("Cannot submit form. No action specified");
      return false;
    }
    callback = callback ? callback : function(){};
    $.post(url, items, callback);
    return false;
  });
}
