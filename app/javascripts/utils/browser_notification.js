// TODO: finish this when chrome for mac or safari supports webkitNotifiactions!

protonet.utils.BrowserNotifications = (function() {
  var notifications = window.webkitNotifications;
  if (notifications && notifications.checkPermission() === 1) {
    notifications.requestPermission();
  }
  return {
    
  };
})();