//= require "escape_for_reg_exp.js"

/**
 * Simple Template engine
 *
 * @example
 *    <script type="protonet/template" id="welcome">
 *      <strong>Hello #{name}</strong>
 *    </script>
 *
 *    <script>
 *      $("#result").html(new protonet.utils.Template("welcome", { name: "John Doe" }));
 *    </script>
 *
 */
protonet.utils.Template = function(id, params) {
  this.html = this._getTemplate(id);
  
  $.each(params || {}, function(key, value) {
    this.html = this.html.split("#{" + key + "}").join(value);
  }.bind(this));
};

protonet.utils.Template.prototype = {
  cache: {},
  
  _getTemplate: function(id) {
    if (!this.cache[id]) {
      this.cache[id] = $("#" + id).html();
    }
    
    return this.cache[id];
  },
  
  toString: function() {
    return $.trim(this.html);
  },
  
  toElement: function() {
    return $(this.html);
  }
};
