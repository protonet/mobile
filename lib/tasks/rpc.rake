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
      break unless line
      match = line.match(regex)
      
      unless match
        puts '  REPLError: Invalid input. Use the form:'
        puts '             object.method "param"=>"value"'
        next
      end
      
      object, method, params = match.captures
      
      begin
        params = eval("{#{params}}") if params
      
        puts "  => #{handler.invoke(object, method, params, User.find(1)).inspect}"
      rescue => ex
        puts "  #{ex.class}: #{ex.message}"
      end
    end
    
    puts
  end

end
