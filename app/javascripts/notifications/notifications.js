/**
 * this is our central notifications hub
 * at the moment it doesn't do anything than just be there as a
 * central pub sub point
 */
protonet.Notifications = (function() {
  var HOST_ELEMENT = $(document.documentElement),
      DEBUG_MODE   = protonet.config.debugMode;
  
  function bind(event, handler) {
    HOST_ELEMENT.bind(event, handler);
    return this;
  }
  
  function unbind(event, handler) {
    HOST_ELEMENT.unbind(event, handler);
    return this;
  }
  
  function trigger(event, data) {
    if (DEBUG_MODE) {
      console.log(event, data);
    }
    
    HOST_ELEMENT.trigger(event, data);
    return this;
  }
  
  function triggerFromSocket(message) {
    return trigger(message.trigger, message);
  }
  
  return {
    bind:               bind,
    unbind:             unbind,
    trigger:            trigger,
    triggerFromSocket:  triggerFromSocket
  };
})();