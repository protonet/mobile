class SystemPreferencesObserver < ActiveRecord::Observer
  def after_save(system_preference)
    case system_preference.var
    when "publish_to_web"
      system_preference.value ? turn_on_publishing : turn_off_publishing
    when "node_name", "node_description", "node_supernode", "node_key", "node_uuid"
      Network.update_local_from_preferences
    end
  end
  
  private
  def turn_on_publishing
    SystemPublishToWeb.publish
  end
  
  def turn_off_publishing
    SystemPublishToWeb.unpublish
  end
end