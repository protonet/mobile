protonet.utils.prettifyDate = (function() {
  var ONE_MINUTE = 60, // seconds
      ONE_HOUR = ONE_MINUTE * 60,
      ONE_DAY = ONE_HOUR * 24,
      TWO_DAYS = ONE_DAY * 2,
      ONE_WEEK = ONE_DAY * 7,
      ONE_MONTH = ONE_DAY * 31;
  
  function prepareOutput(resource, num) {
    return protonet.t(resource, { count: num });
  }
  
  return function(date) {
    var origin = date;
    if (date.constructor != Date) {
      date = Number(date) || date;
      date = new Date(date);
    }
    var now = new Date().getTime(),
        backThen = date.getTime(),
        difference = (now - backThen) / 1000;
    
    if (isNaN(backThen)) {
      return origin;
    }
    
    if (difference < ONE_MINUTE) {
      return protonet.t("label_just_now");
    }
    
    if (difference < ONE_HOUR) {
      return prepareOutput("label_minutes_ago", Math.floor(difference / ONE_MINUTE));
    }
    
    if (difference < ONE_DAY) {
      return prepareOutput("label_hours_ago", Math.floor(difference / ONE_HOUR));
    }
    
    if (difference < TWO_DAYS) {
      return protonet.t("label_yesterday");
    }
    
    if (difference < ONE_WEEK) {
      return prepareOutput("label_days_ago", Math.ceil(difference / ONE_DAY));
    }
    
    if (difference < ONE_MONTH) {
      return prepareOutput("label_weeks_ago", Math.ceil(difference / ONE_WEEK));
    }
    
    return prepareOutput("label_months_ago", Math.ceil(difference / ONE_MONTH));
  };
})();