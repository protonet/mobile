$(document).ready(function(){
  $("#search-form input[name='search_term']").focus();
  $("#search-form").live('submit', function(e){
    e.preventDefault();
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
  });

  $(".feed-viewer .more-tweets a").live('click', function(event){
    event.preventDefault();
    var container = $(this).parents(".feed-viewer");
    $.get(
      event.target.href + '.js',
      {},
      function(data) {
        container.html(data);
      }
    );
  });

  bind_pagination_clicks();
});

function bind_pagination_clicks() {
  $(".pagination a").click(function(e){
    e.preventDefault();
    $.get(
      $(this).attr('href'),
      { 'format': 'js' },
      function(data) {
        $("#search-results").html(data);
        bind_pagination_clicks();
      }
    );
  });
}
