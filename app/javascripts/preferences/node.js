protonet.preferences.Node = function() {
  this.container = $("#node-settings");
  this.form = this.container.find('form');
  this._observeForm();
};

protonet.preferences.Node.prototype = {
  
  _observeForm: function() {
    this.form.submit(function(){
      $.post($(this).attr('action'), $(this).serialize(), function(data){
        $('#preferences-details').html(data);
      });
      return false;
    });
  }
}