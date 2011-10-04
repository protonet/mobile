//= require "en.js"

protonet.t = function(key, templateData) {
  var str = protonet.i18n[key] || key,
      templateVariable;
  if (templateData) {
    for (templateVariable in templateData) {
      str = str.split("#{" + templateVariable + "}").join(templateData[templateVariable]);
    }
  }
  return str;
};