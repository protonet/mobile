/**
 * Behaviors let you extend elements in an unobtrusive way.
 * You can add rules by specifying a CSS selector and a corresponding action.
 * 
 * Behaviors are automatically assigned as soon as the DOM is ready.
 * 
 * @author Christopher Blum (inspired by Martin Kleppe)
 * 
 * @example
 *  // add single behavior via class assignment
 *  protonet.utils.Behaviors.add("input[title]", handlePlaceholderFunc);
 * 
 *  // add single behavior
 *  protonet.utils.Behaviors.add("input.focus", function(input){ input.focus();});
 * 
 *  // add behavior with dom event
 *  protonet.utils.Behaviors.add("a.stop:click", function(link, event){ event.preventDefault(); });
 *  
 *  // add multiple behaviors
 *  protonet.utils.Behaviors.add({
 *    "input:click, textarea:click": function(element) { element.select(); },
 *    "input.focus":                 function(input) { input.focus();},
 *    "a.stop:click":                function(link, event) { event.peventDefault(); }
 *  });
 */
protonet.utils.Behaviors = (function() {
  var rules                   = {},
      selectorCache           = {},
      $document               = $(document),
      PSEUDOS                 = $.expr.match.CHILD,
      REG_EXP_SELECTOR_SPLIT  = /,\s*/;
  
  /**
   * Prepare selector by splitting multiple selectors ("div.bar, span.foo") into
   * single selectors
   * @param {String} selector The CSS selector(s).
   * @param {Function|Class} action Action or class to process element.
   */
  function _addRule(selectors, action) {
    $.each(selectors.split(REG_EXP_SELECTOR_SPLIT), function(i, selector) {
      _addSingleRule(selector, action);
    });
  }
  
  /**
   * Adds a single rule.
   * @param {String} selector The CSS selector.
   * @param {Function|Class} action Action or class to process element.
   */
  function _addSingleRule(selector, action) {
    rules[selector] = action;
    if ($.isReady) {
      _assign(selector, action);
    }
  }
  
  /**
   * Assigns a single rule.
   * @param {String} selector The CSS selector.
   * @param {Function|Class} action Action or class to process element.
   * @param {Element|String} [container] Optional parent element or selector on which the behaviors should applied (It looks inside this container for matches)
   */
  function _assign(selector, action, container) {
    selector = _splitSelector(selector);
    container = container || $document;
    var allElements;
    
    if (selector.event) {
      if (container.data(selector.original) != action) {
        container
          .data(selector.original, action)
          .delegate(selector.key, selector.event, function(event) {
            action($(this), event);
          });
      }
    } else {
      if (container) {
        allElements = $(container).find(selector.key);
      } else {
        allElements = $(selector.key);
      }
      allElements.each(function(i, element){
        element = $(element);
        if (element.data(selector.original) != action) {
          element.data(selector.original, action);
          action(element);
        }
      });
    }
  }
  
  /**
   * Splits a given selector string into "key" and "event" object.
   * Used internally to observe events.
   * 
   * @param {String} selector The full selector.
   * 
   * @returns {Object} An object with "key" and "event properties".
   * 
   * @example
   *  protonet.utils.Behaviors._splitSelector("ul:first-child:hover"); 
   *  // return: { key: "ul:first-child", event: "hover" }
   */
  function _splitSelector(selector) {
    var parts,
        part,
        key,
        cache = selectorCache[selector];
    
    if (cache){ 
      return cache;
    } else {
      // split "#id.class:event" into "#id.class" and "event"
      parts = selector.split(":");
      key = parts.shift();
      
      // reject pseudo classes such as "last-child"
      while ((part = parts[0]) && PSEUDOS.test(":" + part)) {
        key += ":" + part;
        parts.shift();
      }
      
      // return seperated key and event properties
      return selectorCache[selector] = {
        key:      key,
        event:    parts.join(":") || null,
        original: selector
      };
    }
  }
  
  /**
   * Adds one or more behavior rules.
   * Hint: You can also pass an event name (eg. "a:click") to observe.
   * 
   * @param {String|Object} hashOrSelector An rules has or the CSS selector.
   * @param {Function|Class} [action] Action or class to process element.
   * 
   * @example
   *  // add single behavior via class assignment
   *  protonet.utils.Behaviors.add("input[title]", handlePlaceholderFunc);
   * 
   *  // add single behavior
   *  protonet.utils.Behaviors.add("input.focus", function(input) { input.focus();});
   * 
   *  // add behavior with dom event
   *  protonet.utils.Behaviors.add("a.stop:click", function(link, event) { event.preventDefault(); });
   *  
   *  // add multiple behaviors
   *  protonet.utils.Behaviors.add({
   *    "input.focus": function(input) { input.focus();},
   *    "a.stop:click": function(link, event) { event.preventDefault(); },
   *  });
   */
  function add(hashOrSelector, action) {
    if ($.type(hashOrSelector) == "string"){
      _addRule(hashOrSelector, action);
    } else {
      $.each(hashOrSelector, _addRule);
    }
  }
  
  /**
   * Initializes or updates all rules.
   * 
   * @param {String or Object} container This optional param causes, 
   *  that the update-functionality is narrowd down on the fields inside the container.
   *
   * @example
   *  $("#my_div").update("<span class='hide'>Foo</span>");
   *  protonet.utils.Behaviors.update();
   *
   *  or you can hand over a container which should be updated:
   *  protonet.utils.Behaviors.update("#my_form");
   */
  function update(container) {
    $.each(rules, function(key, value) {
      _assign(key, value, container);
    });
  }
  
  /**
   * Assign behaviors on document ready.
   */
  function initialize() {
    $(function() {
      update();
    });
  }
  
  return {
    initialize: initialize,
    update:     update,
    add:        add
  };
})();

protonet.utils.Behaviors.initialize();