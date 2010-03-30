class AddChannelSpecificFolders < ActiveRecord::Migration
  def self.up
    Channel.home.create_folder
    Dir.glob(System::FileSystem.cleared_path('/*')).reject {|d| d.match(/\/#{Channel.home.id}$/)}.each do |f|
      FileUtils.mv(f, "#{f}".sub(/user-files\//, "user-files/#{Channel.home.id}/"))
    end
    Channel.all.reject {|c| c.id == Channel.home.id}.each do |channel|
      channel.create_folder
    end
  end

  def self.down
    # not implemented, but this is non-destructive
  end
end
