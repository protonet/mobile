require 'rubygems'
require 'sinatra'
require 'warden'
require 'erb'
require 'protolink'
require 'json'
require 'sprockets'
require 'sinatra/sprockets'
require 'closure-compiler'
require 'yui/compressor'

class MobileProtonet < Sinatra::Application

  configure do
    # enable :sessions
    enable :dump_errors, :raise_errors, :show_exceptions

    set :api_url, (ENV['API_URL'] || "http://localhost:3000")
    set :api_user, (ENV['API_USER'] || "admin")
    set :api_pw, (ENV['API_PW'] || "admin")
    set :node, Protolink::Protonet.open(settings.api_url).node
    set :views, ['views/', 'views/authentication/']
    set :production, ENV['RACK_ENV'] === 'production'
    set :public_path, '/Users/henning/Sites/protonet/mobile/public'


    # make sure :key and :secret be in-sync with initializers/secret_store.rb initializers/secret_token.rb
    use Rack::Session::Cookie, 
      :key => '_rails_dashboard_session', 
      :secret => '8aGyTR1FdVFhco6k2lQh2372P/piisUgTFJfjhD+4oZAoVB7i1jc2tWGGeU20YFaff9z1Nobs9/tr+BhjWr9oYM538otEiTX0x12wJDEvKyutGOaqN9fy5VYEUPY+RDEGKYFtGoIdOVo3lCYr0o1pwh3L2J9h90N'
      
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

end

require_relative 'models/user.rb'

require_relative 'routes/main.rb'
require_relative 'routes/authentication.rb'