class SearchController < ApplicationController
  def index
    respond_to do |format|
      format.html do
        @channels = current_user.verified_channels
      end

      format.js do
        if search_term = params[:search_term]
          search_channel_ids = current_user.verified_channels.map{|c| c.id}

          @search_results = Tweet.search do
            if channel_id = params[:channel_id] && search_channel_ids.include?(channel_id.to_i)
              search_channel_ids = [channel_id]
            end

            with(:channel_ids, search_channel_ids)
            keywords(search_term)
          end

          if @search_results && @search_results.total > 0
            render :partial => "search/search_results",
              :locals => {:search_results => @search_results}
          else
            render :partial => "search/no_search_results"
          end
        end
      end
    end
  end
end

