protonet.utils.InlineHint = function(input, text) {
  if (!input || !input.length) {
    throw new Error("InlineHint: Not able to find input element!");
  }
  if (!text) {
    throw new Error("InlineHint: Text is empty or not set!");
  }
  
  this._input = input;
  this._text = text;
  this._form = this._input.parents("form");
  
  this._set();
  this._observe();
};

protonet.utils.InlineHint.prototype = {
  CLASS_NAME: "inline-hint",
  
  _observe: function() {
    this._form.submit(this._unset.bind(this));
    this._input.focus(this._unset.bind(this)).blur(this._set.bind(this));
  },
  
  _set: function() {
    if (!this._input.val() || this._input.val() == this._text) {
      this._input.val(this._text).addClass(this.CLASS_NAME);
    }
  },
  
  _unset: function() {
    if (this._input.val() == this._text) {
      this._input.val("").removeClass(this.CLASS_NAME);
    }
  }
};