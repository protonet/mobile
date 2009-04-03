@routes = {     
  
  # Für Interne Suchanfragen vom Lokalem Node
  
  1 => {:url => 'search' , :method => 'get', :controller => 'simple_search'                    
  },                                          
  
  # Suchanfrage die Extern gehandelt werden
  
  2 => {
    :url => 'search' ,:method => 'post', :controller => 'search_request'                    
  },                                           
  
  # Vom Lokalem Node kann neue Assets hinzugefügt werden
  
  3 => {
    :url => 'asset' ,:method => 'post', :controller => 'add_asset'                                   
  },                                                     
  
  # Lokaler Node kann Assets löschen
  
  4 => {
    :url => 'asset' ,:method => 'delete', :controller => 'delete_asset'
  },                                 
  
  # Lokaler Node kann Assets bearbeiten
  
  5 => {
    :url => 'asset' ,:method => 'put', :controller => 'edit_asset'
  }
}