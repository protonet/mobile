/**
 * Takes an ISO8601 date (eg. 2005-03-26T19:51:34Z, 2010-03-14T14:15:12-07:00)
 * and converts it into a javascript date object
 *
 * Inspired by
 * http://dansnetwork.com/2008/11/01/javascript-iso8601rfc3339-date-parser/
 */
protonet.utils.parseISO8601Date = (function() {
  var REG_EXP = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/,
      date = new Date();
  
  return function(str) {
    var match = str.match(REG_EXP);
    if (match) {
      var offset = 0;

      date.setUTCDate(1);
      date.setUTCFullYear(parseInt(match[1], 10));
      date.setUTCMonth(parseInt(match[3], 10) - 1);
      date.setUTCDate(parseInt(match[5], 10));
      date.setUTCHours(parseInt(match[7], 10));
      date.setUTCMinutes(parseInt(match[9], 10));
      date.setUTCSeconds(parseInt(match[11], 10));
      if (match[12]) {
        date.setUTCMilliseconds(parseFloat(match[12]) * 1000);
      } else {
        date.setUTCMilliseconds(0);
      }
      if (match[13] != "Z") {
        offset = (match[15] * 60) + parseInt(match[17],10);
        offset *= ((match[14] == '-') ? -1 : 1);
        date.setTime(date.getTime() - offset * 60 * 1000);
      }
    } else {
      date.setTime(Date.parse(str));
    }
    return date;
  };
})();