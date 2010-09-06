Channel.home
begin
  Network.find(1)
rescue
  network = Network.new(:id => 1, :name => 'local', :description => 'this is your own node', :key => 'encryptme', :supernode => 'flyingseagull.de:1099')
  network.save
  Network.update_all("id = 1", "id = #{network.id}")
end
begin
  User.find(0)
rescue
  u = User.new(:id => 0, :name => 'Anonymous', :login => 'Anonymous')
  u.id = 0 
  u.save_with_validation(false)
end
