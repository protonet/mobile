class UrlBind         
  
  
  def add arg     
    @routes ||=Array.new
    @routes.push arg
  end
                 
  def show
    @routes
  end
  
end

