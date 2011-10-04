$(function() {
  $(".invitation-message-link").click(function() {
    $(this).remove();
    $(".invitation-message").show();
  });
});