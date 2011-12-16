namespace :rpc do

  desc 'Boots up a REPL for the RPC interface'
  task :repl => :environment do
    require 'lib/rpc/handler'
    
    handler = Rpc::Handler.new
    
    regex = /^([a-z_]+)\.([a-z_]+)(?: (.+))?$/
    
    while 0
      STDOUT.print 'rpc> '
      STDOUT.flush
      
      line = STDIN.gets
      match = line.match(regex)
      
      unless match
        puts '  REPLError: Invalid input. Use the form:'
        puts '             object.method "param"=>"value"'
        next
      end
      
      object, method, params = match.captures
      
      params = eval("{#{params}}") if params
      
      begin
        puts "  => #{handler.invoke(object, method, params).inspect}"
      rescue => ex
        puts "  #{ex.class}: #{ex.message}"
      end
    end
  end

end
