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
        success, error = turn_on_publishing
      else
        turn_off_publishing
      end
      
      flash[:error] = "Publish to web error: " + error.inspect + "." if error
      redirect_to(:controller => "/preferences", :action => "show", :section => "publish_to_web")
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