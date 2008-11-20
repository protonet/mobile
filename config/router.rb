# Merb::Router is the request routing mapper for the merb framework.
#
# You can route a specific URL to a controller / action pair:
#
#   match("/contact").
#     to(:controller => "info", :action => "contact")
#
# You can define placeholder parts of the url with the :symbol notation. These
# placeholders will be available in the params hash of your controllers. For example:
#
#   match("/books/:book_id/:action").
#     to(:controller => "books")
#   
# Or, use placeholders in the "to" results for more complicated routing, e.g.:
#
#   match("/admin/:module/:controller/:action/:id").
#     to(:controller => ":module/:controller")
#
# You can specify conditions on the placeholder by passing a hash as the second
# argument of "match"
#
#   match("/registration/:course_name", :course_name => /^[a-z]{3,5}-\d{5}$/).
#     to(:controller => "registration")
#
# You can also use regular expressions, deferred routes, and many other options.
# See merb/specs/merb/router.rb for a fairly complete usage sample.

Merb.logger.info("Compiling routes...")
Merb::Router.prepare do  

  # Adds the required routes for merb-auth using the password slice
  # slice(:merb_auth_slice_password, :name_prefix => nil, :path_prefix => "")

  # RESTful routes
  r.resource :chat_messages
  r.resource :users
  
  r.match("/profile").to(:controller => "users", :action => "show").name(:profile)
  
  r.match("/login").to(:controller => "sessions", :action => "create").name(:login)
  r.match("/logout").to(:controller => "sessions", :action => "destroy").name(:logout)
  
  r.match("/register").to(:controller => "users", :action => "new").name(:register)

  r.match("/home").to(:controller => 'instruments', :action =>'index').name(:home)


  # This is the default route for /:controller/:action/:id
  # This is fine for most cases.  If you're heavily using resource-based
  # routes, you may want to comment/remove this line to prevent
  # clients from calling your create or destroy actions with a GET
  default_routes
  
  # Change this for your home page to be available at /
  r.match('/').to(:controller => 'instruments', :action =>'index')
end