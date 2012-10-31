//= require 'lib/jquery-class-create/class.js'
//= require 'lib/google-code-prettify.js'

//= require 'utils/browser.js'
//= require 'utils/template.js'
//= require 'utils/extensions.js'
//= require 'utils/prettify_date.js'
//= require "utils/strip_tags.js"
//= require 'utils/parse_url.js'
//= require 'utils/convert_to_absolute_url.js'
//= require 'utils/escape_for_reg_exp.js'
//= require 'utils/imageproxy.js'
//= require 'utils/viewport.js'
//= require 'utils/mobile.js'
//= require 'utils/sandbox.js'

//= require 'utils/escape_html.js'
//= require 'utils/quotify.js'
//= require 'utils/codify.js'
//= require 'utils/textify.js'
//= require 'utils/smilify.js'
//= require 'utils/heartify.js'
//= require 'utils/emojify.js'
//= require 'utils/auto_link.js'
//= require 'utils/is_window_focused.js'
//= require 'utils/to_max_size.js'
//= require 'utils/prettify_code.js'
//= require 'utils/prettify_diff.js'

//= require 'storage/storage.js'

//= require 'i18n/translate.js'

//= require 'events/emitter.js'
//= require_self

//= require 'ui/flash_message.js'
//= require 'ui/pretty_date.js'

//= require 'text_extensions/text_extensions.js'
//= require 'text_extensions/config.js'
//= require 'text_extensions/render.js'

//= require 'dispatcher/dispatcher.js'
//= require 'dispatcher/websocket.js'
//= require 'dispatcher/flash_socket.js'
//= require 'dispatcher/http_streaming.js'

//= require 'models/meep.js'
//= require 'models/channel.js'
//= require 'models/user.js'
//= require 'models/file.js'

//= require 'controllers/channelsController.js'
//= require 'controllers/usersController.js'

//= require 'pages.js'
//= require 'pages/dashboard.js'
//= require 'pages/channel.js'
//= require 'pages/user-list.js'

//= require 'protonet.js'

protonet.Emitter = new protonet.events.Emitter();
$.extend(protonet, protonet.Emitter);