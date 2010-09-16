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

    var search_term = $("#search_term").val();
    var page = $("#search-results span.current").html();
    page = parseInt(page, 10)
    if (isNaN(page)) { page = 1; }

    $.get(
      $(this).attr("href") + '.js?search_term=' + search_term + '&page=' + page,
      {},
      function(data) { container.html(data); }
    );
  });

//   $("#search-pager span a").live("click", function(event) {
//     event.preventDefault();
//     alert("going to scroll to " + $(this).attr("href"));
//     $.scrollTo($(this).attr("href"), 800, {easing:'elasout'});
//   });

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
