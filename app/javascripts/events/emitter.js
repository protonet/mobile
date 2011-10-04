/**
 * this is our central event emitter
 * at the moment it doesn't do anything than just be there as a
 * central pub sub point
 */
$.extend(protonet, (function() {
  var $host = $(document.documentElement);
  
  function bind(event, handler) {
    $host.bind(event, handler);
    return this;
  }
  
  function unbind(event, handler) {
    $host.unbind(event, handler);
    return this;
  }
  
  function trigger(event, data) {
    if (protonet.config.debug_mode) {
      console.log(event, data);
    }
    
    $host.trigger(event, data);
    return this;
  }
  
  function one(event, handler) {
    $host.one(event, handler);
    return this;
  }
  
  return {
    bind:    bind,
    unbind:  unbind,
    trigger: trigger,
    one:     one
  };
})());