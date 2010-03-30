/**
 * Converts a object with width/height properties to a max size object
 *
 * protonet.utils.toMaxSize({ width: 20, height: 10 }, { width: 10, height: 10 });
 *  => { width: 10, height: 5 }
 */
protonet.utils.toMaxSize = function(size, maxSize) {
  var height = size.height, width = size.width;
  
  if (width > maxSize.width) {
    height = height / 100 * (maxSize.width / (width / 100));
    width = maxSize.width;
  }
  if (height > maxSize.height) {
    width = width / 100 * (maxSize.height / (height / 100));
    height = maxSize.height;
  }
  
  return {
    width: width,
    height: height
  };
};