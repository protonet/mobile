//= require "escape_for_reg_exp.js"
//= require "escape_html.js"

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
protonet.utils.Template = function(id, params, escapeHtml) {
  this.html = this._getTemplate(id);
  
  $.each(params || {}, function(key, value) {
    if (escapeHtml) {
      value = protonet.utils.escapeHtml(value);
    }
    this.html = this.html.split("#{" + key + "}").join(value);
  }.bind(this));
};

protonet.utils.Template.prototype = {
  cache: {},
  
  _getTemplate: function(id) {
    if (!this.cache[id]) {
      this.cache[id] = $.trim(document.getElementById(id).innerHTML);
    }
    
    return this.cache[id];
  },
  
  toString: function() {
    return this.html;
  },
  
  to$: function() {
    return $(this.html);
  }
};
