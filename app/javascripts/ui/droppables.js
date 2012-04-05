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
        ondragleave:   $.noop
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
  
  function _dragenter(target, $element, dataTransfer) {
    $element.data("dragover", true).addClass(target.className);
    target.ondragenter($element, dataTransfer);
  }
  
  function _dragleave(target, $element) {
    $element.data("dragover", false).removeClass(target.className);
    target.ondragleave($element);
  }
  
  function _observe(target) {
    if (observed) {
      return;
    }
    
    observed = true;
    
    $html.on("dragover", function(event) {
      var dataTransfer = event.dataTransfer;
      if (!dataTransfer) {
        return;
      }
      
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        $html.trigger("dragend");
      }, (0.4).seconds());
      
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
              _dragenter(target, $element, dataTransfer);
            }
          } else if (wasBeingDraggedOn) {
            _dragleave(target, $element);
          }
        });
      });
      
      if (potentialTargets.length) {
        $html.addClass("dragover");
        event.preventDefault();
      }
      
      if (activeTargets.length) {
        dataTransfer.dropEffect = "copy";
      } else if (potentialTargets.length) {
        dataTransfer.dropEffect = "none";
      }
    });
    
    
    $html.on("dragend", function(event) {
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
    target = $.extend({}, defaultConfig, target);
    
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
      $(target.elements).data("dragover", false).removeClass(target.className);
    }
    
    var index = targets.indexOf(target);
    if (index !== -1) {
      targets.splice(index, 1);
    }
  }
  
  return {
    add:    add,
    remove: remove
  };
})();
