/**
 * Global User Configuration
 * TODO: Merge with protonet.config
 */
protonet.user.Config = {
  configs: {
    /**
     * Only supports boolean values so far
     */
    sound: {
      type: "boolean",
      labels: {
        "true": "turn sound off",
        "false": "turn sound on"
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
    
  },
  
  load: function() {
    
  },
  
  _renderConfigs: function() {
    var container = $("#mini-menu .option-links");
    $.each(this.configs, function(key, config) {
      this._getElement(key, config).appendTo(container);
    }.bind(this));
  },
  
  _getElement: function(key, config) {
    switch (config.type) {
      case "boolean":
        return this._getBooleanElement(key, config);
    }
  },
  
  _getBooleanElement: function(key, config) {
    var anchor = $("<a />", {
      href: "#" + key,
      html: config.labels[String(this.get(key))],
      click: function(event) {
        event.preventDefault();
        var newValue = !this.get(key);
        this.set(key, newValue);
        anchor.html(config.labels[String(newValue)]);
      }.bind(this)
    });
    return anchor;
  }
};