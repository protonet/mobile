protonet.preferences.UsersSpecific = function() {
  $("input:text[title], input:password[title], textarea[title]").each(function() {
    var input = $(this);
    new protonet.utils.InlineHint(input, input.attr("title"));
  });
};

protonet.preferences.UsersSpecific.prototype = {
  _observeCheckbox: function() {
    this.form.change(function(){
      $.post(this.action, $(this).serialize());
      return false;
    });
  }
}