protonet.preferences.UsersGeneral = function() {
  this.form = $("#allow-dashboard");
  this._observeCheckbox();
};

protonet.preferences.UsersGeneral.prototype = {
  _observeCheckbox: function() {
    this.form.change(function(){
      $.post(this.action, $(this).serialize());
      return false;
    });
  }
}