class RestartPublishToWebForMonitoring < ActiveRecord::Migration
  def self.up
    if !!SystemPreferences.publish_to_web
      begin
        SystemPublishToWeb.unpublish
        sleep 3
        SystemPublishToWeb.publish
      rescue
        # nothing to do move along...
      end
    end
  end

  def self.down
  end
end
