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
    this._storage = window.localStorage || {};
    
    this._renderConfigs();
  },
  
  set: function(key, value) {
    this._storage[key] = JSON.stringify(value);
  },
  
  get: function(key) {
    var value = this._storage[key];
    if (typeof(value) != "undefined" && value !== null) {
      return JSON.parse(value);
    } else {
      var config = this.configs[key];
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
    var container = $("#user-navigation .settings");
        list = $("<ul />");
    $.each(this.configs, function(key, config) {
      this._getElement(key, config).appendTo(list);
    }.bind(this));
    
    container
      .append(list)
      .click(function(event) { event.preventDefault(); });
  },
  
  _getElement: function(key, config) {
    switch (config.type) {
      case "boolean":
        return this._getBooleanElement(key, config);
    }
  },
  
  _getBooleanElement: function(key, config) {
    var value = String(this.get(key));
    var item = $("<li />", {
      html:       config.labels[value],
      className:  value,
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