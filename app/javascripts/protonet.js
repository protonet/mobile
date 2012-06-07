// protonet namespaces
var protonet = protonet || {};

protonet.browser          = protonet.browser          || {};
protonet.config           = protonet.config           || {};
protonet.utils            = protonet.utils            || {};
protonet.data             = protonet.data             || { ext: {} };
protonet.media            = protonet.media            || {};
protonet.pages            = protonet.pages            || {};
protonet.effects          = protonet.effects          || {};
protonet.events           = protonet.events           || {};
protonet.text_extensions  = protonet.text_extensions  || { utils: {} };
protonet.timeline         = protonet.timeline         || {};
protonet.i18n             = protonet.i18n             || {};
protonet.ui               = protonet.ui               || { files: {}, users: {} };

protonet.FILES_MIME_TYPE  = "protonet/file";

//= require "events/emitter.js"
$.extend(protonet, new protonet.events.Emitter());