protonet.preferences.UsersGeneral = function() {
  this.forms = $("#users-details form");
  this._observeForms();
};

protonet.preferences.UsersGeneral.prototype = {
  _observeForms: function() {
    this.forms.each(function(i) {
      $(this.forms[i]).change(function(){
        $.post(this.action, $(this).serialize());
        return false;
      });
    }.bind(this));
  }
}