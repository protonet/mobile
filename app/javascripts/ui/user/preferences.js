protonet.ui.User.Preferences = {
  initialize: function() {
    this._render();
  },
  
  _render: function() {
    var preferences = protonet.data.User.getPreferences(),
        $container  = $("#my-widget .settings");
        $list       = $("<ul>");
    $.each(preferences, function(key, config) {
      this._get$Element(key, config).appendTo($list);
    }.bind(this));
    
    $container.append($list);
  },
  
  _get$Element: function(key, config) {
    switch (config.type) {
      case "boolean":
        return this._getBoolean$Element(key, config);
      case "notification":
        return this._getNotification$Element(key, config);
      default:
        return null;
    }
  },
  
  _getNotification$Element: function(key, config) {
    var value = String(protonet.data.User.getPreference(key)),
        $item = $("<li>", {
          html:       config.labels[value],
          "class":    value,
          click:      function(event) {
            event.preventDefault();
            var oldValue = protonet.data.User.getPreference(key),
                newValue = !oldValue,
                callback = function(newValue) {
                  protonet.data.User.setPreference(key, newValue);
                  $item.removeClass(String(oldValue)).addClass(String(newValue)).html(config.labels[String(newValue)]);
                };
                
            if (newValue) {
              protonet.ui.Notification.requestPermission(callback);
            } else {
              callback(newValue);
            }
          }
        });
    return $item;
  },
  
  _getBoolean$Element: function(key, config) {
    var value = String(protonet.data.User.getPreference(key)),
        $item = $("<li>", {
          html:       config.labels[value],
          "class":    value,
          click:      function(event) {
            event.preventDefault();
            var oldValue = protonet.data.User.getPreference(key),
                newValue = !oldValue;
            protonet.data.User.setPreference(key, newValue);
            $item.removeClass(String(oldValue)).addClass(String(newValue)).html(config.labels[String(newValue)]);
          }
        });
    return $item;
  }
};