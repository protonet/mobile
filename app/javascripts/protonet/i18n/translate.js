protonet.t = protonet.translate = (function() {
  function isPluralization(resource) {
    return typeof(resource) === "object" && resource !== null && typeof(resource.other) === "string";
  }
  
  return function(key, templateData) {
    var i18n        = protonet.i18n,
        splittedKey = key.split("."),
        namespace   = i18n[splittedKey[0]],
        resource,
        templateVariable;
    
    if (typeof(namespace) === "string" || isPluralization(namespace)) {
      namespace = null;
    }
    
    resource = namespace ? (namespace[splittedKey[1]] || splittedKey[1]) : (protonet.i18n[splittedKey[0]] || splittedKey[0]);
    
    if (isPluralization(resource)) {
      if (templateData && templateData.count === 1 && resource.one) {
        resource = resource.one;
      } else if (templateData && templateData.count === 0 && resource.zero) {
        resource = resource.zero;
      } else {
        resource = resource.other;
      }
    }
    
    if (templateData) {
      for (templateVariable in templateData) {
        resource = resource.split("%{" + templateVariable + "}").join(templateData[templateVariable]);
      }
    }
    
    return resource;
  };
})();
