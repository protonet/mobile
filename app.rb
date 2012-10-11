require 'rubygems'
require 'sinatra'
require 'warden'
require 'mysql2'
require 'erb'
require 'protolink'
require 'json'
require 'sprockets'
require 'sinatra/sprockets'
require 'closure-compiler'
require 'yui/compressor'
require 'yaml'

class MobileProtonet < Sinatra::Application

  configure do
    # enable :sessions
    enable :dump_errors, :raise_errors, :show_exceptions

    set :production, ENV['RACK_ENV'] === 'production'
    set :api_url, (settings.production ? "http://localhost" : "http://localhost:3000")
    set :node, Protolink::Protonet.open(settings.api_url).node
    set :views, ['views/', 'views/authentication/']
    set :public_path, '/Users/henning/Sites/protonet/mobile/public'

    set :socket_port, 5000
    set :xhr_streaming_port, 8000
    set :websocket_port, 5001
    set :websocket_ssl_port, 5002
    set :nodejs_port, 8124

    # get RailsSessionSecret
    result = Mysql2::Client.new(
        :host => "localhost",
        :encoding => "utf8",
        :username => "root",
        :database => settings.production ? "dashboard_production" : "dashboard_development"
      ).query(
        "select value from system_preferences where var = 'session_secret'"
      )

    use Rack::Session::Cookie, 
      :key => '_rails_dashboard_session', 
      :secret => YAML.load(result.first["value"])

    if settings.production?
      # TODO
      load File.expand_path("../Rakefile", __FILE__)
      Rake::Task["assets:precompile"].execute
    end

    Warden::Strategies.add(:password) do
      def valid?
        params["user"]["login"] || params["user"]["password"]
      end
     
      def authenticate!
        response = Protolink::Protonet.open(
          (ENV['API_URL'] || "http://localhost:3000"), 
          params["user"]["login"], 
          params["user"]["password"]
        ).auth

        if response
          # TODO: find a smarter way
          session["login"] = params["user"]["login"]
          session["password"] = params["user"]["password"]
          session["user"] = response.body
          success!(User.new(nil, JSON.parse(session[:user])))
        else
          fail!("Could not log in")
        end

      end
    end

    Warden::Manager.serialize_into_session{|user| ["User", [user.id], user.password_salt] }

    # Borrowed from https://gist.github.com/217362
    Warden::Manager.before_failure do |env, opts|
      env['REQUEST_METHOD'] = "POST"
    end

    # Point Warden to the Sinatra App
    use Warden::Manager do |manager|
      manager.failure_app = MobileProtonet
      manager.default_scope = :user
      manager.default_strategies :password
    end

  end

  helpers Sinatra::Sprockets::Helpers

  helpers do

    def warden
      env['warden']
    end

    def find_template(views, name, engine, &block)
      Array(views).each { |v| super(v, name, engine, &block) }
    end

    def protonet
      @protonet ||= Protolink::Protonet.open(settings.api_url, session[:login], session[:password]) 
    end

    def current_user
      @current_user ||= session[:user] && User.new(protonet, JSON.parse(session[:user]))
    end

    def server_name
      if request.env["SERVER_NAME"] == "_"
        request.env["HTTP_HOST"].sub(/:[0-9]*/, "")
      else
        request.env["SERVER_NAME"]
      end
    end

    def is_apache?
      request.respond_to?(:server_software)
      # request.server_software == 'apache'
    end

    def base_url
      if settings.production
        "#{host}"
      else
        "#{host}:3000"
      end
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

    def require_authentication
      redirect '/sign_in' unless current_user
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

    puts "request: #{env['REQUEST_METHOD']} #{request.path}"
  end

  not_found do
    puts "not found: #{request.path}, redirected to '/'"
    redirect '/'
  end

  error do
    # TODO: implement notifier
    redirect '/'
  end

end

require_relative 'models/user.rb'

require_relative 'routes/main.rb'
require_relative 'routes/authentication.rb'