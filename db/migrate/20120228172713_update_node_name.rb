class UpdateNodeName < ActiveRecord::Migration
  def self.up
    local_node = Node.local
    if local_node.name == "local"
      local_node.update_attribute(:name, SystemBackend.hostname) rescue nil
    end
  end

  def self.down
  end
end
