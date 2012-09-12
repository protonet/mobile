//= require 'lib/fastclick.js'
//= require 'lib/jquery-class-create/class.js'
//= require 'lib/iscroll/src/iscroll.js'

//= require 'utils/browser.js'
//= require 'utils/template.js'
//= require 'utils/extensions.js'
//= require 'utils/prettify_date.js'
//= require 'utils/parse_url.js'
//= require 'utils/convert_to_absolute_url.js'
//= require 'utils/escape_for_reg_exp.js'
//= require 'utils/imageproxy.js'
//= require 'utils/viewport.js'

//= require 'events/emitter.js'
//= require_self

//= require 'dispatcher/dispatcher.js'
//= require 'dispatcher/websocket.js'
//= require 'dispatcher/flash_socket.js'
//= require 'dispatcher/http_streaming.js'

//= require 'models/meep.js'
//= require 'models/channel.js'
//= require 'models/user.js'

//= require 'controllers/channelsController.js'
//= require 'controllers/usersController.js'

//= require 'pages.js'
//= require 'pages/pretty_date.js'
//= require 'pages/dashboard.js'
//= require 'pages/channel.js'

//= require 'protonet.js'

protonet.Emitter = new protonet.events.Emitter();
$.extend(protonet, protonet.Emitter);