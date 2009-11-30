require "sprockets"
require "sprockets_helper"
require "sprockets_organization"
require "sprockets_mechanism"
require "sprocket"
require "sprockets_application"

class ActionController::Base
  helper :sprockets
end
