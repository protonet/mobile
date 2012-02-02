protonet.ui.User.GettingStarted = (function() {
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
      .on("user.changed_avatar", function(user) {
        if (user.id == viewer) {
          _done("upload-avatar");
        }
      })
      
      .on("meep.rendered", function($element, data) {
        if (data.user_id == viewer) {
          _done("write-meep");
        }
      })
      
      .on("user.added", function() {
        _done("invite-user");
      })
      
      .on("user.changed_password", function() {
        _done("change-password");
      })
      
      .on("user.subscribed_channel", function(data) {
        if (data.user_id == viewer && !data.rendezvous) {
          _done("create-channel");
        }
      });
  }
  
  return {
    initialize: function() {
      $container = $("div.getting-started");
      if (!$container.length) {
        return;
      }
      _observe();
      _getTodoList();
    }
  };

})();