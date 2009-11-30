#
# Use the DutyFree capistrano plugin to get a bunch of capistrano tasks which can be used to 
# not only monitor your services by monit but also start, stop and restart them.
#
# Example (in capistrano deploy.rb):
# 
#   # capistrano role definition
#   role :remote_search, "server_1"
#
# Note: If you use the capistrano multistage plugin, define duty_free roles after requiring multistage.
#   
#   # require plugin
#   require File.dirname(__FILE__) + '/../lib/cap/duty_free'
#   
#   # define monit watches for your roles. afterwards, a monit template needs to be written for the watch 
#   # 'postings_remote_search_service'.
#   duty_free_plugin.role :remote_search, %w(postings_remote_search_service)
#
#   # hook to deployment process
#   before 'deploy:restart' do
#     duty_free.reinitialize # generate and upload new monit configuration files, reload monit
#     duty_free.all.restart # trigger monit to restart the services for all roles
#     #duty_free.remote_search.restart # trigger monit to restart the services for a role
#   end
#
#
# A core part of this plugin is to generate the monit configuration files.
# You need to place monit_templates for watches in 'config/daemons/monit_templates/' named 
# '<watch_name>.monit'. 
#
# Set variables for a watch in the deploy.rb. The variables will be available in the monit 
# template of the watch as daemon[<variable_name>].
#
# Example (in capistrano deploy.rb):
#
#   set :postings_remote_search_service, { :instances => [:cpu, [0,1]], :baseport => 9000 }
#
# You can provide general role variables (i.e. ':foo_bar' ) to all watches when defining the 
# role/watches in deploy.rb.
#
# Example (in capistrano deploy.rb):
#
#   duty_free_plugin.role :messaging, 
#     %w(posting_activation_processor delete_posting_story_processor),
#     { :foo_bar => 'a variable' }
# 
# This way, all watches defined on the role :messaging will get the :foo_bar variable set.
#
#
# The following variables are used from duty_free to enable special behaviour:
#
#   :monit_template => 'name_of_template'
#
#   This will try to find a template 'config/daemons/monit_templates/name_of_template.monit' instead 
#   of using the watch name as convention for the template name.
#
#   :instances => [:instance_variable_name, [1,6]]
#
#   This will result in rendering the monit template twice into the same monit configuration file providing
#   daemon[:instance_variable_name] with the value 1 in the first rendering and 6 in the second. Use the 
#   daemon[:index] variable for the current iteration.
# 
#
# There are predefined variables available in the monit template of a watch:
#
#   daemon          - Hash containg all defined variables for a watch
#   daemon[:name]   - Name of the watch
#   daemon[:index]  - Index of current iteration (just available for instances processing)
#   All capistrano variables, like 'current_path', 'shared_path', ...
#
# 
# The capistrano tasks are divided into major tasks which can be found using 'cap -T' and minor tasks which
# are available using 'cap -vT'.
#
#
# heavily borrowed from san_juan, thx jnewland. me started more down earth before reaching into heaven.
# -- freetwix
#
module DutyFree
  @@roles = []
  @@role_watch_options = {}
  
  def roles
    @@roles
  end
  
  def role_watch_options(role)
    @@role_watch_options[role] || {}
  end
  
  def monit_command
    "/opt/monit/bin/monit -c #{current_path}/config/daemons/generated/monit.conf "
  end
  
  def monit_pid
    #TODO: may be changed in the monit.conf - needs a good idea ...!
    "#{shared_path}/pids/monit.pid"
  end
  
  def role(role, watches, role_watch_options={})
    @@roles << role
    @@role_watch_options[role] = role_watch_options

    namespace :duty_free do
      unless @meta_tasks_defined
        # desc "Generate and distribute configurations for the watches of all roles and the monit daemons."
        task :configure do
          duty_free.all.monit.configure
          duty_free.all.generate_templates
        end
        
        # desc "Reload monits after distributing the configurations for the watches and monits of all roles."
        task :reinitialize do
          duty_free.configure
          duty_free.all.monit.ensure_reload
        end
        
        namespace :all do
          namespace :monit do
            # much of duplication below. this way we ensure monit commands to be executed on 
            # unique hosts, instead of all hosts defined by roles (which may restart monit n 
            # times, for each role)
            # desc "Monit syntax check for watches of all roles."
            task :syntax do
              run("#{duty_free_plugin.monit_command} -t", :roles => duty_free_plugin.roles)
            end

            desc "Monit summary for watches of all roles."
            task :summary do
              run("#{duty_free_plugin.monit_command} summary", :roles => duty_free_plugin.roles)
            end

            # desc "Monit configure for all roles."
            task :configure do
              monit_config = ERB.new(IO.read("config/daemons/monit.conf")).result(binding)
              # TODO, BUG CAPISTRANO: :mode option is executed on all servers!
              put(monit_config, "#{current_path}/config/daemons/generated/monit.conf", :roles => duty_free_plugin.roles)
              run("chmod 700 #{current_path}/config/daemons/generated/monit.conf", :roles => duty_free_plugin.roles)
            end

            # desc "Monit stop for all roles"
            task :stop do
              run("#{duty_free_plugin.monit_command} quit", :roles => duty_free_plugin.roles)
            end
            # desc "Monit start for all roles"
            task :start do
              run("#{duty_free_plugin.monit_command}", :roles => duty_free_plugin.roles)
            end
            # desc "Monit reload for all roles"
            task :reload do
              run("#{duty_free_plugin.monit_command} reload", :roles => duty_free_plugin.roles)
              sleep(2)
            end
            
            # desc "Monit ensure reload (do start monit if not exists) for all roles"
            task :ensure_reload do
              cmd = <<-CMD
              if [ -f #{duty_free_plugin.monit_pid} ]; then
                 pid=`cat #{duty_free_plugin.monit_pid}`;
                 test -n "$pid" && kill -0 $pid && #{duty_free_plugin.monit_command} reload && exit 0;
              fi;
              #{duty_free_plugin.monit_command};
              CMD
              run(cmd, :roles => duty_free_plugin.roles)
              sleep(2) # ensure http support has been started
            end
          end
          
          # desc "Generate and distribute the monit templates for watches of all roles"
          task :generate_templates do
            duty_free_plugin.roles.each { |role| send(role).generate_templates }
          end
          
          %w(start restart stop).each do |t|
            desc "#{t.capitalize} watches of all roles."
            task t do
              # if someone configured other components in monit (like, in the worst case, mysql), 
              # all will be restarted! be sure do have configured an application only monit (default)!
              
              #run("#{duty_free_plugin.monit_command} #{t} all", :roles => duty_free_plugin.roles)
              duty_free_plugin.roles.each { |role| send(role).send(t) }
            end
          end          
        end
      end
      @meta_tasks_defined = true
      
      namespace role do
        namespace :monit do
          # desc "Monit syntax check of all monit templates for #{role}."
          task :syntax, :roles => role do
            run("#{duty_free_plugin.monit_command} -t")
          end
      
          desc "Monit summary for #{role}."
          task :summary, :roles => role do
            run("#{duty_free_plugin.monit_command} summary")
          end
          
          # desc "Monit configure for #{role}."
          task :configure, :roles => role  do
            monit_config = ERB.new(IO.read("config/daemons/monit.conf")).result(binding)
            # TODO, BUG CAPISTRANO: :mode option is executed on all servers!
            put(monit_config, "#{current_path}/config/daemons/generated/monit.conf")
            run("chmod 700 #{current_path}/config/daemons/generated/monit.conf")
          end
          
          # desc "Monit stop for #{role}"
          task :stop, :roles => role do
            run("#{duty_free_plugin.monit_command} quit")
          end
          # desc "Monit start for #{role}"
          task :start, :roles => role do
            run("#{duty_free_plugin.monit_command}")
          end
          # desc "Monit reload for #{role}"
          task :reload, :roles => role do
            run("#{duty_free_plugin.monit_command} reload")
          end
        end
      
        # do not use monit with 'restart all' to restart all services! if someone 
        # configured other components in monit (like in the worst case mysql), all 
        # will be restarted!
        %w(start restart stop).each do |t|
          desc "#{t.capitalize} watches for #{role}"
          task t, :roles => role do
            watches.each do |watch|
              send(watch).send(t)
            end
          end
        end
      
        def read_monit_template(watch, options={})
          #provide the daemon configuration as 'daemon' hash in the daemon's monit template
          daemon = options
          #use a defined monit template or fallback to the watch as convention for the monit template
          template = daemon.delete(:monit_template) || watch
          ERB.new(IO.read("config/daemons/monit_templates/#{template}.monit")).result(binding)
        end
        
        # desc "Generate and distribute the monit templates for #{role}"
        task :generate_templates, :roles => role do
          watches.each do |watch|      
            options = duty_free_plugin.role_watch_options(role).merge(fetch(watch.to_sym, {})).merge(:name => watch, :stage => stage)

            template = "# generated by dutyfree for your rails app, will probably be overwritten on every deploy\n"

            if (instances = options.delete(:instances)).blank?
              template << read_monit_template(watch, options)
            else
              #currently only one instances variable allowed, maybe cartesian product of nested instances in future
              instances_name  = instances[0]
              instance_values = instances[1]
              instance_values.each_with_index do |instance_value, index|
                options.merge!(
                  instances_name => instance_value,
                  :index => index
                )
                template << read_monit_template(watch, options)
                template << "\n"
              end
            end

            put(template, "#{current_path}/config/daemons/generated/#{watch}_#{rails_env}.monit")
          end
        end
      
        watches.each do |watch|
          namespace watch do
            %w(start restart stop).each do |t|
              # desc "#{t.capitalize} #{watch} for #{role}"
              task t, :roles => role do
                run("#{duty_free_plugin.monit_command} -g #{watch} #{t} all")
              end
            end
          end
        end        
      end
    end
  end
end

Capistrano.plugin :duty_free_plugin, DutyFree