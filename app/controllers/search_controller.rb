class SearchController < ApplicationController
  def index
    respond_to do |format|
      format.html do
        @channels = current_user.verified_channels
      end

      format.js do
        if search_term = params[:search_term]
          @search_results = Tweet.search do
            with(:channel_ids, [params[:channel_id]]) if params[:channel_id] && params[:channel_id].to_i > 0
            keywords(search_term)
          end

          return_html = "HELLO"
          if @search_results
            render :partial => "search/search_results",
              :locals => {:search_results => @search_results}
          end
        end
      end
    end
  end
end