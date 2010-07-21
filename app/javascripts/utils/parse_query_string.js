/**
 * Takes a query string and converts it into an object
 * @example
 *    protonet.utils.parseQueryString("&foo=1&bar=test");
 *      => { foo: 1, bar: "test" }
 *    protonet.utils.parseQueryString("&tweet[foo]=1&tweet[bar]=test");
 *      => { tweet: { foo: 1, bar: "test" } }
 *
 * Please note:
 *    This method only supports one dimension of modelling within query strings. 
 *    The following query string would cause problems:
 *      "&test[foo][bar]=1"
 */
protonet.utils.parseQueryString = (function() {
  var REG_EXP_MODEL_NAME = /(.+?)\[(.+?)\]/;
      REG_EXP_QUESTION_MARK = /.*?\?/;
  
  return function(str, separator) {
    separator = separator || "&";
    
    var splittedStr = $.trim(str).replace(REG_EXP_QUESTION_MARK, "").split(separator),
        obj = {};
    
    $.each(splittedStr, function(i, keyValue) {
      if (!keyValue) {
        return;
      }
      
      var splittedKeyValue  = keyValue.split("="),
          key               = decodeURIComponent(splittedKeyValue[0]),
          value             = decodeURIComponent(splittedKeyValue[1]),
          modelMatch        = key.match(REG_EXP_MODEL_NAME) || [],
          modelName         = modelMatch[1],
          modelKey          = modelMatch[2];
      
      if (modelName && modelKey) {
        obj[modelName] = obj[modelName] || {};
        obj[modelName][modelKey] = value;
      } else {
        obj[key] = value;
      }
    });
    
    return obj;
  };
})();