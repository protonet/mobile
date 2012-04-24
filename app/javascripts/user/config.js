//= require "../ui/notification.js"

/**
 * Global User Configuration
 */
protonet.user.Config = {
  configs: {
    /**
     * Only supports boolean values so far
     */
    sound: {
      type: "boolean",
      labels: {
        "true":   "sound <span class=\"on\">on</span>",
        "false":  "sound <span class=\"off\">off</span>"
      },
      defaultValue: true
    },
    
    smilies: {
      type: "boolean",
      labels: {
        "true":  "smilies <span class=\"on\">on</span>",
        "false": "smilies <span class=\"off\">off</span>"
      },
      defaultValue: true
    }
  },
  
  initialize: function() {
    this._renderConfigs();
  },
  
  set: function(key, value) {
    protonet.storage.set(key, value);
  },
  
  get: function(key) {
    var value  = protonet.storage.get(key),
        config = this.configs[key];
    
    if (config && config.type == "notification") {
      if (!protonet.ui.Notification.hasPermission()) {
        return false;
      }
    }
    
    if (typeof(value) != "undefined" && value !== null) {
      return JSON.parse(value);
    } else {
      return config && config.defaultValue;
    }
  },
  
  store: function() {
    // TODO!
  },
  
  load: function() {
    // TODO!
  },
  
  _renderConfigs: function() {
    var container = $("#my-widget .settings");
        list = $("<ul>");
    $.each(this.configs, function(key, config) {
      this._getElement(key, config).appendTo(list);
    }.bind(this));
    
    container.append(list);
  },
  
  _getElement: function(key, config) {
    switch (config.type) {
      case "boolean":
        return this._getBooleanElement(key, config);
      case "notification":
        return this._getNotificationElement(key, config);
      default:
        return null;
    }
  },
  
  _getNotificationElement: function(key, config) {
    var value = String(this.get(key)),
        item = $("<li>", {
          html:       config.labels[value],
          "class":    value,
          click:      function(event) {
            event.preventDefault();
            var oldValue = this.get(key),
                newValue = !oldValue,
                callback = function(newValue) {
                  this.set(key, newValue);
                  item.removeClass(String(oldValue)).addClass(String(newValue)).html(config.labels[String(newValue)]);
                }.bind(this);
                
            if (newValue) {
              protonet.ui.Notification.requestPermission(callback);
            } else {
              callback(newValue);
            }
          }.bind(this)
        });
    return item;
  },
  
  _getBooleanElement: function(key, config) {
    var value = String(this.get(key)),
        item = $("<li>", {
          html:       config.labels[value],
          "class":    value,
          click:      function(event) {
            event.preventDefault();
            var oldValue = this.get(key),
                newValue = !oldValue;
            this.set(key, newValue);
            item.removeClass(String(oldValue)).addClass(String(newValue)).html(config.labels[String(newValue)]);
          }.bind(this)
        });
    return item;
  }
};




/**
 * Webkit Notifications for replies
 */
if (protonet.ui.Notification.supported()) {
  protonet.user.Config.configs.reply_notification = {
    type: "notification",
    labels: {
      "true":  "desktop notifications <span class=\"on\">on</span>",
      "false": "desktop notifications <span class=\"off\">off</span>"
    },
    defaultValue: false
  };
}
