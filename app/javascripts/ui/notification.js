/**
 * Create Growl-like notifications
 *
 * @example
 *    new protonet.ui.Notification({
 *      image: "/images/user_picture.png",
 *      title: "Attention!",
 *      text:  "Hello this is the body of the notification"
 *    });
 */
protonet.ui.Notification = function(config) {
  var hasPermission = protonet.ui.Notification.hasPermission();
  if (hasPermission) {
    var notification = window.webkitNotifications.createNotification(
      config.image, config.title, config.text
    );
    notification.ondisplay = function() {
      setTimeout(function() { notification.cancel(); }, 5000);
    };
    notification.show();
  }
};


/**
 * Check whether notifications
 * are allowed/supported
 */
protonet.ui.Notification.hasPermission = (function() {
  var notifications = window.webkitNotifications;
  return function() {
    if (notifications) {
      notifications.checkPermission = notifications.checkPermission || notifications.permissionLevel;
      return notifications.checkPermission() === 0;
    }
    return false;
  };
})();


/**
 * Check whether notifications are supported
 * by the browser
 */
protonet.ui.Notification.supported = function() {
  return !!window.webkitNotifications;
};


/**
 * Reqzests notification access
 */
protonet.ui.Notification.requestPermission = function(callback) {
  callback = callback || $.noop;
  try {
    window.webkitNotifications.requestPermission(function() {
      callback(protonet.ui.Notification.hasPermission());
    });
  } catch(e) { callback(false); };
};