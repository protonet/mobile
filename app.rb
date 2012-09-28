require 'rubygems'
require 'sinatra'
require 'erb'
require 'protolink'
require 'json'
require 'sprockets'
require 'sinatra/sprockets'
require 'closure-compiler'
require 'yui/compressor'

class MobileProtonet < Sinatra::Application

  configure do
    enable :sessions
    enable :dump_errors, :raise_errors, :show_exceptions

    set :session_secret, "protonet-mobile"
    set :api_url, (ENV['API_URL'] || "http://localhost:3000")
    set :api_user, (ENV['API_USER'] || "admin")
    set :api_pw, (ENV['API_PW'] || "admin")
    set :node, Protolink::Protonet.open(settings.api_url).node
    set :views, ['views/', 'views/authentication/']
    set :production, ENV['RACK_ENV'] === 'production'
    set :public_path, '/Users/henning/Sites/protonet/mobile/public'

    if settings.production?
      # TODO
      load File.expand_path("../Rakefile", __FILE__)
      Rake::Task["assets:precompile"].execute
    end
  end

  helpers Sinatra::Sprockets::Helpers

  helpers do

    def find_template(views, name, engine, &block)
      Array(views).each { |v| super(v, name, engine, &block) }
    end

    def protonet
      @protonet ||= Protolink::Protonet.open(settings.api_url, session[:login], session[:password]) 
    end

    def current_user
      @current_user ||= session[:user] && User.new(protonet, JSON.parse(session[:user]))
    end

    def node_base_url
      if settings.production
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
      login = session[:login]
      passwd = session[:password]
      session.clear
      session[:login] = login
      session[:password] = passwd
      @current_user = nil
      response = Protolink::Protonet.open(settings.api_url, session[:login], session[:password]).auth
      session[:user] = response.body
    end

    if request.request_method === "POST"
      cache_control :no_cache
    end
  end

end

require_relative 'models/user.rb'

require_relative 'routes/main.rb'
require_relative 'routes/authentication.rb'