/**
 * this is our central notifications hub
 * at the moment it doesn't do anything than just be there as a
 * central pub sub point
 */
protonet.Notifications = (function() {
  var HOST_ELEMENT = $(document.documentElement);
  
  function bind(event, handler) {
    HOST_ELEMENT.bind(event, handler);
    return this;
  }
  
  function unbind(event, handler) {
    HOST_ELEMENT.unbind(event, handler);
    return this;
  }
  
  function trigger(event, data) {
    if (protonet.config.debugMode) {
      console.log(event, data);
    }
    
    HOST_ELEMENT.trigger(event, data);
    return this;
  }
  
  function one(event, handler) {
    HOST_ELEMENT.one(event, handler);
    return this;
  }
  
  return {
    bind:    bind,
    unbind:  unbind,
    trigger: trigger,
    one:     one
  };
})();