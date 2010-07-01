/**
 * this is our central notifications hub
 * at the moment it doesn't do anything than just be there as a
 * central pub sub point
 */
protonet.Notifications = (function() {
  var PSEUDO_ELEMENT = $("<div />");
  
  function bind(event, handler) {
    PSEUDO_ELEMENT.bind(event, handler);
    return this;
  }
  
  function unbind(event, handler) {
    PSEUDO_ELEMENT.unbind(event, handler);
    return this;
  }
  
  function trigger(event, data) {
    PSEUDO_ELEMENT.trigger(event, data);
    return this;
  }
  
  function triggerFromSocket(message) {
    return trigger(message.trigger, message);
  }
  
  return {
    bind: bind,
    unbind: unbind,
    trigger: trigger,
    triggerFromSocket: triggerFromSocket
  };
})();