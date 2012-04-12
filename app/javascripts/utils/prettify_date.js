protonet.utils.prettifyDate = (function() {
  var JUST_NOW = "Just now",
      MINUTES_AGO = "{t} minute{s} ago",
      HOURS_AGO = "{t} hour{s} ago",
      YESTERDAY = "Yesterday",
      DAYS_AGO = "{t} day{s} ago",
      WEEKS_AGO = "{t} week{s} ago",
      ONE_MINUTE = 60, // seconds
      ONE_HOUR = ONE_MINUTE * 60,
      ONE_DAY = ONE_HOUR * 24,
      TWO_DAYS = ONE_DAY * 2,
      ONE_WEEK = ONE_DAY * 7,
      ONE_MONTH = ONE_DAY * 31;
  
  function prepareOutput(template, num) {
    return template
      .replace("{t}", num)
      .replace("{s}", num > 1 ? "s" : "");
  }
  
  return function(date) {
    var origin = date;
    
    if (date.constructor != Date) {
      date = new Date(date);
    }
    var now = new Date().getTime(),
        backThen = date.getTime(),
        difference = (now - backThen) / 1000;
    
    if (isNaN(backThen)) {
      return origin;
    }
    
    if (difference < ONE_MINUTE) {
      return JUST_NOW;
    }
    
    if (difference < ONE_HOUR) {
      return prepareOutput(MINUTES_AGO, Math.floor(difference / ONE_MINUTE));
    }
    
    if (difference < ONE_DAY) {
      return prepareOutput(HOURS_AGO, Math.floor(difference / ONE_HOUR));
    }
    
    if (difference < TWO_DAYS) {
      return YESTERDAY;
    }
    
    if (difference < ONE_WEEK) {
      return prepareOutput(DAYS_AGO, Math.ceil(difference / ONE_DAY));
    }
    
    if (difference < ONE_MONTH) {
      return prepareOutput(WEEKS_AGO, Math.ceil(difference / ONE_WEEK));
    }
    
    return date.toDateString();
  };
})();