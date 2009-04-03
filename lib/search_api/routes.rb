require 'lib/url_bind'

@routes = UrlBind.new


@routes.add :method => 'get'    ,:url =>  'search', :controller => 'simple_search'
@routes.add :method => 'post'   ,:url =>  'search', :controller => 'search_request'                 
@routes.add :method => 'post'   ,:url =>  'asset',  :controller => 'add_asset'                                   
@routes.add :method => 'delete' ,:url =>  'asset',  :controller => 'delete_asset'  
@routes.add :method => 'put'    ,:url =>  'asset',  :controller => 'edit_asset' 
