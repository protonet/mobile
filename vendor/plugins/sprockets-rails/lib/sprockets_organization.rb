module SprocketsOrganization
  def routes(map, method = :resource)
    if method == :resource
      map.resource(:sprockets, :only => :show)
    elsif method == :resources
      map.resources(:sprockets, :only => [:index, :show])
    end
  end
  
  def sprocket(name)
    Sprocket.new(name)
  end
end
