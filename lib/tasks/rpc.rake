namespace :rpc do

  desc 'Boots up a REPL for the RPC interface'
  task :repl => :environment do
    require 'lib/rpc/handler'

    handler = Rpc::Handler.new

    regex = /^([a-z_]+)\.([a-z_]+)(?: (.+))?$/

    STDOUT.print 'rpc> '
    STDOUT.flush

    while 0
      line = STDIN.gets
      break unless line
      match = line.match(regex)

      unless match
        puts '  REPLError: Invalid input. Use the form:'
        puts '             object.method "param"=>"value"'

        STDOUT.print 'rpc> '
        STDOUT.flush
        next
      end

      object, method, params = match.captures

      begin
        params = eval("{#{params}}") if params

        handler.invoke(object, method, params, User.find(1)) do |result|
          puts "  => #{result.inspect}"

          STDOUT.print 'rpc> '
          STDOUT.flush
        end
      rescue => ex
        puts "\r  #{ex.class}: #{ex.message}"

        STDOUT.print 'rpc> '
        STDOUT.flush
      end
    end

    puts
  end

end
