protonet.preferences.Privacy = function() {
  this.forms = $("#preferences-details form");
  this._observeForms();
};

protonet.preferences.Privacy.prototype = {
  _observeForms: function() {
    this.forms.each(function(i) {
      $(this.forms[i]).change(function(){
        $.post(this.action, $(this).serialize(), function(response){
          protonet.Notifications.trigger("flash_message." + response.type, response.message)
        });
        return false;
      });
    }.bind(this));
  }
}