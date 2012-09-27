module Preferences
  class PublishToWebController < ApplicationController
    filter_access_to :all, :context => :publish_to_web
    
    def update
      if (setting = params[:preferences][:publish_to_web] == "true") && params[:preferences][:publish_to_web_name].blank?
        flash[:error] = t("preferences.flash_message_web_publishing_url_error")
        redirect_to(:controller => "/preferences", :action => "show", :section => "publish_to_web") and return
      end
      
      SystemPreferences.publish_to_web_name = params[:preferences][:publish_to_web_name].downcase
      SystemPublishToWeb.queue_ssl_cert
      
      if setting
        turn_off_publishing
        success, error = turn_on_publishing
      else
        turn_off_publishing
      end
      
      if error
        error_message = JSON.parse(error.message)["errors"].join(", ") rescue error.message
        flash[:error] = t("preferences.flash_message_web_publishing_error", :error_message => error_message)
      else
        if setting
          flash[:notice] = t("preferences.flash_message_web_publishing_on_success")
        else
          flash[:notice] = t("preferences.flash_message_web_publishing_off_success")
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
