//= require "../utils/generate_random_number.js"

protonet.ui.Droppables = (function() {
  var undef,
      timeout,
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
  
  function _containsAllowedTypes(dataTransfer, target) {
    if (target.types === "all") {
      return true;
    }
    
    var i       = 0,
        types   = dataTransfer.types || [],
        length  = types.length;
    
    for (; i<length; i++) {
      if (target.types.indexOf(types[i]) !== -1) {
        return true;
      }
    }
    return false;
  }
  
  function _dragenter(target, $element, event) {
    $element.data("dragover", true).addClass(target.className);
    target.ondragenter($element, event);
    $element.one("drop." + target._id, function(event) {
      target.ondrop($element, event);
    });
  }
  
  function _dragleave(target, $element) {
    $element.data("dragover", false).removeClass(target.className);
    target.ondragleave($element);
    $element.off("drop." + target._id);
  }
  
  function _observe(target) {
    if (observed) {
      return;
    }
    
    observed = true;
    
    var oldTarget,
        lastDragover = 0,
        shouldPreventDefault,
        oldDropEffect;
    
    $html.on("dragover", function(event) {
      var dataTransfer = event.dataTransfer;
      if (!dataTransfer) {
        return;
      }
      
      if (event.target === oldTarget && (new Date() - lastDragover) < (0.5).seconds()) {
        if (oldDropEffect) {
          dataTransfer.dropEffect = oldDropEffect;
        }
        if (shouldPreventDefault) {
          event.preventDefault();
        }
        return;
      }
      
      lastDragover = new Date();
      oldTarget = event.target;
      
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        $html.trigger("dragend");
      }, (0.6).seconds());
      
      var oldPotentialTargets = potentialTargets;
      
      // Indicate a drop area by setting class target.indicator on elements when the drag contains
      // desired data types
      potentialTargets = [];
      $.each(targets, function(i, target) {
        var isTypeMatch  = _containsAllowedTypes(dataTransfer, target),
            wasTypeMatch = oldPotentialTargets.indexOf(target) !== -1;
        if (isTypeMatch) {
          potentialTargets.push(target);
          $(target.elements).addClass(target.indicator);
        } else if (wasTypeMatch) {
          $(target.elements).removeClass(target.indicator);
        }
      });
      
      // Find targets on which content is currently dragged: highlight them and fire a ondragenter()
      activeTargets = [];
      
      var queue = [];
      $.each(potentialTargets, function(i, target) {
        $(target.elements).each(function(i, element) {
          var $element          = $(element),
              wasBeingDraggedOn = $element.data("dragover"),
              isBeingDraggedOn  = event.target === element || (target.includeChilds && $.contains(element, event.target));
          if (isBeingDraggedOn && target.condition($element)) {
            if (activeTargets.indexOf(target) === -1) {
              activeTargets.push(target);
            }
            if (!wasBeingDraggedOn) {
              queue.push(function() {
                _dragenter(target, $element, event);
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
        event.preventDefault();
        shouldPreventDefault = true;
      } else {
        shouldPreventDefault = false;
      }
      
      if (activeTargets.length) {
        dataTransfer.dropEffect = oldDropEffect = "copy";
      } else if (potentialTargets.length) {
        dataTransfer.dropEffect = oldDropEffect = "none";
      }
    });
    
    
    $html.on("dragend", function(event) {
      shouldPreventDefault = oldDropEffect = undef;
      
      clearTimeout(timeout);
      
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
      
      potentialTargets = activeTargets = [];
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
    if (potentialTargets.indexOf(target) !== -1) {
      $(target.elements).removeClass(target.indicator);
    }
    
    if (activeTargets.indexOf(target) !== -1) {
      $(target.elements).data("dragover", false).removeClass(target.className).off("drop." + target._id);
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
