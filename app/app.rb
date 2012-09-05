require 'sinatra'
require 'erb'
require 'protolink'
require 'json'

class MobileProtonet < Sinatra::Application
  enable :sessions
  enable :dump_errors, :raise_errors, :show_exceptions

  configure do
    set :session_secret, "protonet-mobile"
    set :api_url, (ENV['API_URL'] || "http://localhost:3000")
    set :api_user, (ENV['API_USER'] || "admin")
    set :api_pw, (ENV['API_PW'] || "admin")
    set :node, Protolink::Protonet.open(settings.api_url, nil ,nil).node
    set :views, ['views/', 'views/authentication/']
    set :env, ENV['RACK_ENV'] || "development"
  end
  
  

  helpers do

    def find_template(views, name, engine, &block)
      Array(views).each { |v| super(v, name, engine, &block) }
    end

    def protonet
      @protonet ||= Protolink::Protonet.open(settings.api_url, session[:login], session[:password]) 
    end

    def current_user
      @current_user ||= session[:user] && CurrentUser.new(protonet, session[:user])
    end

    def node_base_url
      if settings.env == "production"
        "#{host}/node"
      else
        "#{host}:8124"
      end
    end

    def host
      request.env['rack.url_scheme'] + "://" + request.env['HTTP_HOST'].gsub(/:\d+/,"")
    end
  end

  before do
    if params[:reload]
      @current_user = nil
      response = Protolink::Protonet.open(settings.api_url, session[:login], session[:password]).auth
      session[:user] = JSON.parse(response.body)
    end
  end

  class CurrentUser
    attr_reader :id, :login, :email, :communication_token

    def initialize(connection, attributes = {})
      @connection = connection
      @id = attributes["id"]
      @login = attributes["login"]
      @email = attributes["email"]
      @communication_token = attributes["communication_token"]
    end

    def subscribed_channels
      @subscribed_channels ||= connection.find_subscribed_channels
    end

    protected
      def connection
        @connection
      end
  end
end

require_relative 'authentication'
require_relative 'main'