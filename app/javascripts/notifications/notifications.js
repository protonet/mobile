// this is our central notifications hub
// at the moment it doesn't do anything than just be there as a
// central pub sub point
protonet.notifications.Central = function() {
  this.self = $(this);
};
protonet.notifications.Central.prototype = {
  'triggerNotification': function(message) {
    this.self.trigger(message.trigger, message);
  }
};

// bind with
// protonet.globals.notifications.bind('file_added', function(e, msg){console.log(msg)})