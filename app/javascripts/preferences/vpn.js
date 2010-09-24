protonet.preferences.Vpn = function() {
  this.container = $("#vpn-settings");
  this._observeLinks();
};

protonet.preferences.Vpn.prototype = {
  _observeLinks: function() {
    this.container.find('a').click(function(){
      $.getJSON(this.href, function(data) {
        $('#vpn-settings .status').html(data['status']);
      });
      return false;
    });
  }
}