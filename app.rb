require 'sinatra'
require 'erb'
require 'protolink'
require 'json'

def protonet
  @protonet ||= Protolink::Protonet.open(settings.api_url) 
end

configure do
  
  set :api_url, (ENV['API_URL'] || "http://localhost:3000")
  set :api_user, (ENV['API_USER'] || "admin")
  set :api_pw, (ENV['API_PW'] || "admin")

  set :node, Protolink::Protonet.open(settings.api_url, nil ,nil).node

  enable :sessions
  enable :dump_errors, :raise_errors, :show_exceptions
end

get '/' do
  erb :index
end

post '/login' do
  response = Protolink::Protonet.open(settings.api_url, params['user']['login'], params['user']['password']).auth
  if response
    puts response.inspect
    session['token'] = response.authentication_token
  else
    @flash = "Invalid login or password."
  end
end

