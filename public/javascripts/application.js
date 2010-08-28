$(document).ready(function(){
  $("#search-form input[name='search_term']").focus();
  $("#search-form").live('submit', function(e){
    $.get(
      $(this).attr('action'),
      {
        'channel_id': $(this).find("select[name='channel_id']").val(),
        'search_term': $(this).find("input[name='search_term']").val(),
        'format': 'js'
      },
      function(data) {
        $("#search-results").html(data);
        bind_pagination_clicks();
      }
    );

    return false;
  });

  bind_pagination_clicks()
 });

function bind_pagination_clicks() {
  $(".pagination a").click(function(e){
    $.get(
      $(this).attr('href'),
      { 'format': 'js' },
      function(data) {
        $("#search-results").html(data);
        bind_pagination_clicks();
      }
    );

    return false;
  });
}
