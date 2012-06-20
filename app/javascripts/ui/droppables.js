//= require "../utils/generate_random_number.js"

protonet.ui.Droppables = (function() {
  var undef,
      dragendTimeout,
      FILES            = ["public.file-url", "application/x-moz-file", "Files"],
      targets          = [],
      activeTargets    = [],
      potentialTargets = [],
      $html            = $("html"),
      observed         = false,
      defaultConfig    = {
        elements:      undef,
        includeChilds: true,
        indicator:     "dragover-possible",
        className:     "dragover",
        types:         "all",
        condition:     function($element) { return true; },
        ondragenter:   $.noop,
        ondragleave:   $.noop,
        ondrop:        $.noop
      };
  
  function _containsAllowedTypes(dataTransferTypes, target) {
    if (target.types === "all") {
      return true;
    }
    
    var i       = 0,
        length  = dataTransferTypes.length;
    
    for (; i<length; i++) {
      if (target.types.indexOf(dataTransferTypes[i]) !== -1) {
        return true;
      }
    }
    return false;
  }
  
  function _dragenter(target, $element) {
    $element.data("dragover", true).addClass(target.className);
    $element.on("dragleave." + target._id, function() { _dragleave(target, $element); });
    target.ondragenter($element);
    $element.one("drop." + target._id, function(event) {
      target.ondrop($element, event);
    });
  }
  
  function _dragleave(target, $element) {
    $element.data("dragover", false).removeClass(target.className);
    target.ondragleave($element);
    $element.off("." + target._id);
  }
  
  function _observe(target) {
    if (observed) {
      return;
    }
    
    observed = true;
    
    var potentialTargets,
        shouldPreventDefault,
        dropEffect;
    
    $html.on("dragover", function(event) {
      var dataTransfer = event.dataTransfer;
      if (!dataTransfer) {
        return;
      }
      
      if (dropEffect) {
        dataTransfer.dropEffect = dropEffect;
      }
      
      if (shouldPreventDefault) {
        event.preventDefault();
      }
      
      clearTimeout(dragendTimeout);
      dragendTimeout = setTimeout(function() {
        $html.trigger("dragend");
      }, 400);
    });
    
    var dragenterTimeout;
    $html.on("dragenter", function(event) {
      var dataTransfer = event.dataTransfer;
      if (!dataTransfer) {
        return;
      }
      
      var dataTransferTypes = dataTransfer.types || [],
          eventTarget       = event.target;
      
      clearTimeout(dragenterTimeout);
      dragenterTimeout = setTimeout(function() {
        if (!potentialTargets) {
          potentialTargets = [];
          $.each(targets, function(i, target) {
            var isTypeMatch  = _containsAllowedTypes(dataTransferTypes, target);
            if (isTypeMatch) {
              potentialTargets.push(target);
              $(target.elements).addClass(target.indicator);
            }
          });
        }
      
        // Find targets on which content is currently dragged: highlight them and fire a ondragenter()
        activeTargets = [];
      
        var queue = [];
        $.each(potentialTargets, function(i, target) {
          $(target.elements).each(function(i, element) {
            var $element          = $(element),
                wasBeingDraggedOn = $element.data("dragover"),
                isBeingDraggedOn  = eventTarget === element || (target.includeChilds && $.contains(element, eventTarget));
            if (isBeingDraggedOn && target.condition($element)) {
              if (activeTargets.indexOf(target) === -1) {
                activeTargets.push(target);
              }
              if (!wasBeingDraggedOn) {
                queue.push(function() {
                  _dragenter(target, $element);
                });
              }
            } else if (wasBeingDraggedOn) {
              queue.unshift(function() {
                _dragleave(target, $element);
              });
            }
          });
        });
      
        $.each(queue, function(i, func) { func(); });
      
        if (potentialTargets.length) {
          $html.addClass("dragover");
          shouldPreventDefault = true;
        } else {
          shouldPreventDefault = false;
        }
      
        if (activeTargets.length) {
          dropEffect = "copy";
        } else if (potentialTargets.length) {
          dropEffect = "none";
        }
      }, 200);
    });
    
    
    $html.on("dragend", function(event) {
      clearTimeout(dragendTimeout);
      
      $html.removeClass("dragover");
      
      $.each(potentialTargets, function(i, target) {
        $(target.elements).removeClass(target.indicator);
      });
      
      $.each(activeTargets, function(i, target) {
        $(target.elements).each(function(i, element) {
          var $element = $(element);
          if ($element.data("dragover")) {
            _dragleave(target, $element);
          }
        });
      });
      
      potentialTargets = shouldPreventDefault = oldDropEffect = undef;
      
      activeTargets = [];
    });
  }
  
  function add(target) {
    for (var i in defaultConfig) {
      if (typeof(target[i]) === "undefined") {
        target[i] = defaultConfig[i];
      }
    }
    
    target._id = protonet.utils.generateRandomNumber(9999);
    
    if (target.types === "files") {
      target.types = FILES;
    }
    
    targets.push(target);
    
    _observe();
  }
  
  function remove(target) {
    if (potentialTargets && potentialTargets.indexOf(target) !== -1) {
      $(target.elements).removeClass(target.indicator);
    }
    
    if (activeTargets.indexOf(target) !== -1) {
      $(target.elements).data("dragover", false).removeClass(target.className).off("." + target._id);
    }
    
    var index = targets.indexOf(target);
    if (index !== -1) {
      targets.splice(index, 1);
    }
  }
  
  return {
    FILES:  FILES,
    add:    add,
    remove: remove
  };
})();
