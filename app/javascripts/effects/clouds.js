//= require "../utils/get_random_number_in_range.js"

protonet.effects.Clouds = function(container, config) {
  this.container = container;
  this.config = $.extend({}, this.defaultConfig, config);
  this.clouds = $();
  
  this._getContainerInfo();
  this._createSky();
  
  this._preload(function() {
    var i = this.config.amount;
    while (i--) {
      this._createCloud();
    }
  }.bind(this));
};

protonet.effects.Clouds.prototype = {
  /**
   * This object will be merged with the config object passed into the constructor
   */
  defaultConfig: {
    amount:           10,                   // Number of how many clouds should be shown
    speed:            5,                    // Number between 1-10
    minSize:          50,                   // Min size of clouds in percent (relative to the natural size)
    maxSize:          100,                  // Max size of clouds in percent (relative to the natural size)
    minStartPosition: -20,                  // Min start position of clouds in percent (relative to the container width)
    maxStartPosition: 80,                   // Max start position of clouds in percent (relative to the container width)
    skyHeight:        450,                  // Height of the area where the clouds should be displayed
    image:            "/images/cloud.png",  // Url to the cloud image
    insertMethod:     "prepend"             // jQuery method for inserting the sky element into the given container
  },
  
  _createCloud: function() {
    var cloudElement = $("<img />", $.extend({
      src: this.config.image
    }, this.config.imageSize));
    
    cloudElement
      .attr(this._getRandomSize())
      .css({ position: "absolute" })
      .css(this._getRandomPosition());
    
    this.clouds = this.clouds.add(cloudElement);
  },
  
  /**
   * Creates a scaffold for where the clouds will be animated in
   * Unfortunately we need two elements for that:
   * One that is absolutely positioned in the background of the container element
   * The other one gets inserted into the first one and receives position: relative; to enable absolute
   * positioning of clouds within it 
   */
  _createSky: function() {
    this.sky = $("<div />").css({
      height:   this.config.skyHeight.px(),
      position: "absolute",
      top:      0,
      left:     0,
      width:    this.containerInfo.width.px()
    }).addClass("sky");
    
    this.skyInner = $("<div />").css({
      height:   this.config.skyHeight.px(),
      position: "relative",
      overflow: "hidden"
    }).addClass("sky-inner");
    
    this.sky.append(this.skyInner);
    this.container[this.config.insertMethod](this.sky);
  },
  
  _getContainerInfo: function() {
    this.containerInfo = {
      width: this.container.width()
    };
  },
  
  /**
   * Preloads the cloud image to get the natural dimensions (width/height)
   * Takes a function as parameter which will be invoked as soon as the image has loaded
   */
  _preload: function(callback) {
    var preloadImage = new Image();
    preloadImage.onload = function() {
      this.config.imageSize = {
        width:  preloadImage.naturalWidth,
        height: preloadImage.naturalHeight
      };
      
      callback();
    }.bind(this);
    preloadImage.src = this.config.image;
  },
  
  /**
   * Calculates a random size for the cloud based on
   * this.config.minSize and this.config.maxSize
   * @return {Object} An object containing width/height properties
   */
  _getRandomSize: function() {
    var randomPercent = protonet.utils.getRandomNumberInRange(this.config.minSize, this.config.maxSize);
    
    var width = Math.round(this.config.imageSize.width / 100 * randomPercent);
    var height = Math.round(this.config.imageSize.height / 100 * randomPercent);
    
    return {
      width: width,
      height: height
    };
  },
  
  /**
   * Calculates a random position for the cloud based on
   * this.config.minStartPosition and this.config.maxStartPosition
   * @return {Object} An object containing top/left css properties
   */
  _getRandomPosition: function() {
    var randomPercentX = protonet.utils.getRandomNumberInRange(this.config.minStartPosition, this.config.maxStartPosition);
    var randomPercentY = protonet.utils.getRandomNumberInRange(this.config.minStartPosition, this.config.maxStartPosition);
    
    var x = Math.round(this.containerInfo.width / 100 * randomPercentX);
    var y = Math.round(this.config.skyHeight / 100 * randomPercentY);
    
    return {
      left: x.px(),
      top:  y.px()
    };
  }
};