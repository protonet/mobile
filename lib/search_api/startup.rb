require 'rubygems'
require 'sinatra'           

require 'routes'    
                       
# Dynamic Binds the Controller to the method calls
@routes.show.each do |v| 
  send v[:method], "/"+ v[:url]  do         
    require 'controller/'+ v[:controller]
  end                                            
  # Output for Debugging
  p "Bind "+ v[:method] +" Method to /"+ v[:url] + " using the Controller controller/" + v[:controller]+".rb"                                  
end



