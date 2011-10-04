//= require "../pages/search.js"

protonet.widgets.Search = Class.create({
  initialize: function() {
    this.$input = $(".side-content .search-form [type=search]");
    this._observe();
  },
  
  _observe: function() {
    if (protonet.user.Browser.IS_TOUCH_DEVICE() || !protonet.config.allow_modal_views) {
      return;
    }
    
    var that = this;
    this.$input.keydown(function() {
      setTimeout(function() {
        var value = that.$input.val();
        if (value.length < 2) {
          return;
        }
        
        var $page = new protonet.utils.Template("search-page-template").toString();
        protonet.ui.ModalWindow.show().content($page, true);
        protonet.pages.Search.initialize();
        $(".modal-window [type=search]").focus().val(value).parents("form").submit();
        that.$input.val("");
      }, 0);
    });
  }
});