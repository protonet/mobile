Before do
  Channel.home
  begin
    Network.find(1)
  rescue
    network = Network.new(:id => 1, :name => 'hamburg-protonet', :description => 'first ever group', :key => 'encryptme', :supernode => 'flyingseagull.de:1099')
    network.save
    Network.update_all("id = 1", "id = #{network.id}")
  end
end