protonet.user.initGettingStarted = (function() {
  var $container, viewer = protonet.config.user_id;
  
  function _done(name) {
    $container.find("." +  name).addClass("done");
    if ($container.find("li.done").length == $container.find("li").length) {
      setTimeout(function() { _removeNewbieFlag(); }, 1000);
    }
  }
  
  function _getTodoList() {
    $.ajax({
      url:  "/users/newbie_todo_list",
      data: { id: protonet.config.user_id },
      success: function(data) {
        $.each(data, function(key, done) {
          if (done) { _done(key); }
        });
      }
    });
  }
  
  function _removeNewbieFlag() {
    $container.remove();
    
    $.ajax({
      url:  "/users/remove_newbie_flag",
      type: "post",
      data: { id: protonet.config.user_id }
    });
  }
  
  function _observe() {
    $container
      .delegate(".write-meep", "click", function() {
        protonet.trigger("form.focus");
        return false;
      })
      
      .delegate(".getting-started-close-link", "click", function() {
        _removeNewbieFlag(this.href);
        return false;
      });
    
    protonet
      .bind("user.changed_avatar", function(e, data) {
        if (data.user_id == viewer) {
          _done("upload-avatar");
        }
      })
      
      .bind("meep.rendered", function(e, $element, data) {
        if (data.user_id == viewer) {
          _done("write-meep");
        }
      })
      
      .bind("user.added", function() {
        _done("invite-user");
      })
      
      .bind("user.changed_password", function() {
        _done("change-password");
      })
      
      .bind("user.subscribed_channel", function(e, data) {
        if (data.user_id == viewer && !data.rendezvous) {
          _done("create-channel");
        }
      });
  }
  
  return function() {
    $container = $("div.getting-started");
    if (!$container.length) {
      return;
    }
    _observe();
    _getTodoList();
  };
})();