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
 * TODO: Trim for speed
 */
protonet.utils.Template = function(id, params) {
  this.templateContainer = $("#" + id);
  this.params = params || {};
};

protonet.utils.Template.prototype = {
  toString: function() {
    var html = this.templateContainer.html();
    $.each(this.params, function(key, value) {
      key = protonet.utils.escapeForRegExp("#{" + key + "}");
      html = html.replace(new RegExp(key, "g"), value);
    });
    return html;
  }
};
