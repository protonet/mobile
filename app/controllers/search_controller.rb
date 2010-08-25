class SearchController < ApplicationController
  def index
    @search = Tweet.search do
      with(:channel_ids, [params[:channel_id]]) if params[:channel_id] && params[:channel_id].to_i > 0
      keywords(params[:search_term])
    end
  end
end