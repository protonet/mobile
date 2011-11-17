class SearchController < ApplicationController
  
  def index
    respond_to do |format|
      format.html {
        render
      }
      format.json {
        perform_search
        
        # TODO: Refactor Meep.prepare_for_frontend and use it here
        render :json => @search_results.hits.map {|hit|
          meep = hit.instance
          meep.text_extension = JSON.parse(meep.text_extension) rescue nil
          meep.attributes.merge({ "channel_id" => nil, "posted_in" => meep.channel.id })
        }.to_json
      }
    end
  end

  private

  def perform_search
    if search_term = params[:search_term]
      search_channel_ids = current_user.channels.verified.map(&:id)
      if search_term.present?
        if (channel_id = params[:channel_id]) && search_channel_ids.include?(channel_id.to_i)
          search_channel_ids = [channel_id.to_i]
        end
          
        @search_results = Meep.search(:include => [:user, :channel]) do
          with(:channel_id, search_channel_ids)
          keywords(search_term)
          order_by(:created_at, :desc)
          paginate(:page => (params[:page] || 1), :per_page => params[:results_count] || Meep::SEARCH_RESULTS_PER_PAGE)
        end
      end
    end
  end
end