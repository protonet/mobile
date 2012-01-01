module Preferences
  class PublishToWebController < ApplicationController
    
    def update
      if (setting = params[:preferences][:publish_to_web] == "true") && params[:preferences][:publish_to_web_name].blank?
        flash[:error] = "Please enter a proper url"
        redirect_to(:controller => "/preferences", :action => "show", :section => "publish_to_web") and return
      end
      
      SystemPreferences.publish_to_web_name = params[:preferences][:publish_to_web_name]
      SystemPreferences.publish_to_web = setting
      
      if SystemPreferences.publish_to_web
        SystemPreferences.public_host = "#{SystemPreferences.publish_to_web_name}.protonet.info"
        SystemPreferences.public_host_https = true
        turn_off_publishing
        success, error = turn_on_publishing
      else
        turn_off_publishing
      end
      if error
        error_message = JSON.parse(error.message)["errors"].join(", ") rescue error.message
        flash[:error] = "Publish to web error: " + error_message + "."
      else
        if SystemPreferences.publish_to_web
          flash[:notice] = "You successfully published your node to the web"
        else
          flash[:notice] = "You successfully turned off web pubslishing"
        end
      end
      respond_to_preference_update
    end
    
    def publish_status
      render :partial => 'status'
    end
    
    private
      def turn_on_publishing
        begin
          SystemPublishToWeb.publish
        rescue RuntimeError => e
          [false, e]
        end
      end

      def turn_off_publishing
        SystemPublishToWeb.unpublish
      end
  end
end