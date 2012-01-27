/**
 * this is our central event emitter
 * at the moment it doesn't do anything than just be there as a
 * central pub sub point
 */
$.extend(protonet, (function() {
  var events = {},
      WHITE_SPACE = /\s+/;
  
  function _on(eventName, handler) {
    var handlerArray = events[eventName] || (events[eventName] = []);
    handlerArray.push(handler);
  }
  
  function on(eventNames, handler) {
    $.each(eventNames.split(WHITE_SPACE), function(i, eventName) {
      _on(eventName, handler);
    });
    return this;
  }
  
  function _after(eventName, handler) {
    var handlerArray = events[eventName] || (events[eventName] = []);
    handlerArray.push(function() {
      var args = $.makeArray(arguments),
          that = this;
      setTimeout(function() { handler.apply(that, args); }, 0);
    });
  }
  
  function after(eventNames, handler) {
    $.each(eventNames.split(WHITE_SPACE), function(i, eventName) {
      _after(eventName, handler);
    });
  }
  
  function _off(eventName, handler) {
    events[eventName] = handler ? $.map(events[eventName] || [], function(currentHandler) {
      return handler === currentHandler ? null : currentHandler;
    }) : [];
    return this;
  }
  
  function off(eventNames, handler) {
    $.each(eventNames.split(WHITE_SPACE), function(i, eventName) {
      _off(eventName, handler);
    });
    return this;
  }
  
  function one(eventName, handler) {
    return on(eventName, function() {
      off(eventName, arguments.callee);
      handler.apply(this, $.makeArray(arguments));
    });
  }
  
  function trigger() {
    var args      = $.makeArray(arguments),
        eventName = args.shift();
    if (protonet.config.debug_mode) {
      console.log(eventName, arguments);
    }
    
    $.each(events[eventName] || [], function(i, handler) {
      handler.apply(protonet, args);
    });
    return this;
  }
  
  return (protonet.Emitter = {
    on:       on,
    off:      off,
    trigger:  trigger,
    one:      one,
    after:    after,
    // legacy:
    bind:     on,
    unbind:   off
  });
})());