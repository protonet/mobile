module Preferences
  class PublishToWebController < ApplicationController
    
    def update
      if params[:preferences][:publish_to_web_name].blank?
        flash[:error] = "Please enter a proper url"
        return respond_to_preference_update(417)
      end
      
      SystemPreferences.publish_to_web_name = params[:preferences][:publish_to_web_name]
      SystemPreferences.publish_to_web = params[:preferences][:publish_to_web] == "true"
      
      if SystemPreferences.publish_to_web
        SystemPreferences.public_host = "#{SystemPreferences.publish_to_web_name}.protonet.info"
        SystemPreferences.public_host_https = true
        turn_on_publishing
      else
        turn_off_publishing
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
end