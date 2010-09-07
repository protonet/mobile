Before do
  
  Channel.home
  
  begin
    Network.find(1)
  rescue
    network = Network.new(:name => 'local', :description => 'this is your own node', :key => 'encryptme', :supernode => 'flyingseagull.de:1099')
    network.save
    Network.update_all("id = 1", "id = #{network.id}")
  end

  begin
    User.find(0)
  rescue
    u = User.new(:name => 'Anonymous', :login => 'Anonymous')
    u.id = 0 
    u.save_with_validation(false)
  end
  
end