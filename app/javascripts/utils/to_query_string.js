/**
 * Takes an object and converts it into a query string
 * @example
 *    protonet.utils.toQueryString({ mercedes: 1, volkswagen: 2 });
 *      => "mercedes=1&volkswagen=2"
 *    protonet.utils.toQueryString({ cars: { mercedes: 1, volkswagen: 2 }});
 *      => "cars[mercedes]=1&cars[volkswagen]=2"
 */

protonet.utils.toQueryString = function(obj, separator) {
  separator = separator || "&";
  var queryString = [];
  $.each(obj, function(key, value) {
    if (value && typeof(value) == "object") {
      $.each(value, function(subKey, subValue) {
        queryString.push(encodeURIComponent(key + "[" + subKey + "]") + "=" + encodeURIComponent(subValue));
      });
    } else {
      queryString.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    }
  });
  
  return queryString.join(separator);
};