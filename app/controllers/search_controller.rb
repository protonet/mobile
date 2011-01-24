class SearchController < ApplicationController
  before_filter :load_channels

  def index
    respond_to do |format|
      format.json do
        perform_search
        
        # TODO: Refactor Tweet.prepare_for_frontend and use it here
        render :json => @search_results.hits.map {|hit|
          meep = hit.instance
          meep.text_extension = JSON.parse(meep.text_extension) rescue nil
          meep.attributes.merge({ :avatar => meep.user.active_avatar_url, :channel_id => nil, :posted_in => meep.channels.first.id })
        }.to_json
      end
      format.html {}
    end
  end
  
  def more_tweets
    respond_to do |format|
      format.json do
        perform_search

        channel = Channel.find(params[:channel_id])
        channel = nil if !@channels.map(&:id).include?(channel.id)
        tweet = channel.tweets.find params[:tweet_id]
        later = params[:later].to_i
        earlier = params[:earlier].to_i
        channel_id = channel.id
        tweets = tweet.from_minutes_after(later,channel_id) + [tweet] + tweet.from_minutes_before(earlier,channel_id)

        render :partial => 'search/search_result',
          :locals => {
            :tweet    => tweet,
            :tweets    => tweets,
            :channel   => channel,
            :pos       => params[:pos],
            :more_time => later,
            :less_time => earlier
          }
      end
    end
  end

  private

  def perform_search
    if search_term = params[:search_term]
      search_channel_ids = current_user.verified_channels.map{|c| c.id}

      if search_term.present?
        if (channel_id = params[:channel_id]) && search_channel_ids.include?(channel_id.to_i)
          search_channel_ids = [channel_id.to_i]
        end

        @search_results = Tweet.search do
          with(:channel_ids, search_channel_ids)
          keywords(search_term, :highlight => true)
          order_by(:created_at, :desc)
          paginate(:page => (params[:page] || 1), :per_page => params[:results_count] || Tweet::SEARCH_RESULTS_PER_PAGE)
        end
      end
    end
  end

  def load_channels
    @channels = current_user.verified_channels
  end
end

