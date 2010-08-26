$(document).ready(function(){
   $("#search-form ").submit(function(e){
     $.post(
       $(this).attr('action'),
       {
         'channel_id': $(this).find("select[name='channel_id']").val(),
         'search_term': $(this).find("input[name='search_term']").val(),
         'format': 'js'
       },
       function(data) {$("#search-results").html(data);}
     );

     return false;
   });
 });
