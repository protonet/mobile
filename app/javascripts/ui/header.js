//= require "../utils/get_scrollbar_width.js"

protonet.ui.Header = {
  initialize: function() {
    this.$header = $("header:first");
    this.select(protonet.config.controller_name, protonet.config.action_name);
    this._observe();
  },
  
  _observe: function() {
    var initialControllerName = protonet.config.controller_name,
        initialActionName     = protonet.config.action_name;
    
    if (!protonet.user.Browser.IS_TOUCH_DEVICE() && protonet.config.allow_modal_views && !$.browser.msie) {
      var $searchInput = this.$header.find("[type=search]").keydown(function() {
        var $page = new protonet.utils.Template("search-page-template").toString();
        setTimeout(function() {
          var value = $searchInput.val();
          if (value.length < 2) {
            return;
          }
          
          protonet.ui.ModalWindow.show().content($page, true);
          protonet.pages.Search.initialize();
          $searchInput.val("");
          $(".modal-window [type=search]").focus().val(value).parents("form").submit();
        }, 0);
      });
    }
    
    this.$header.find("." + initialControllerName + "-controller-link > a").click(function(event) {
      if (protonet.ui.ModalWindow.isVisible()) {
        protonet.ui.ModalWindow.hide();
        return false;
      }
    }.bind(this));
    
    protonet
      .on("modal_window.loaded", function(response, xhr) {
        this.select(xhr.getResponseHeader("X-Controller-Name"), xhr.getResponseHeader("X-Action-Name"));
      }.bind(this))
      
      .on("modal_window.hidden", function() {
        this.$header.css("padding-right", "");
        this.select(initialControllerName, initialActionName);
      }.bind(this))
      
      .on("modal_window.shown", function() {
        // Chrome needs some redrawing...
        this.$header.css("padding-right", protonet.utils.getScrollbarWidth().px()).toggleClass("redraw");
      }.bind(this))
      
      .on("users.update_admin_status", function(data) {
        var $adminLink = this.$header.find(".preferences-controller-link");
        if (data.admin_ids.indexOf(protonet.config.user_id) === -1) {
          $adminLink.hide();
        } else {
          $adminLink.show();
        }
      }.bind(this));
  },
  
  select: function(controllerName, actionName) {
    this.$header.find(".nav-link, .sub-nav-link").removeClass("selected");
    if (controllerName) {
      var controllerLink = this.$header.find("." + controllerName + "-controller-link.nav-link").addClass("selected");
      var nestedControllerLink = controllerLink.find("." + controllerName + "-controller-link");
      if (nestedControllerLink.length > 0) {
        nestedControllerLink.addClass("selected");
      }else{
        if (actionName) {
          controllerLink.find("." + actionName + "-action-link").addClass("selected");
        }
      }
    }
  }
};
