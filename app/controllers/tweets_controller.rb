class TweetsController < ApplicationController
  
  def index
    channel = Channel.find(:first, :conditions => {:id => params[:channel_id]})
    
    if    params[:last_id] && channel
      meeps = channel.tweets.all(:conditions => ["tweets.id < ?", params[:last_id]], :order => "tweets.id DESC", :limit => 25, :include => [:avatar])
    elsif params[:first_id] && channel
      meeps  = channel.tweets.all(:conditions => ["tweets.id > ?", params[:first_id]], :order => "tweets.id DESC", :limit => 100, :include => [:avatar])
    else
      meeps  = []
    end
    
    render :json => Tweet.prepare_for_frontend(channel, meeps)
  end
  
  # request: { :channel_states => { 1 => 123123, 2 => 213123 } }
  # response: { 1 => [{ :message => 'foo bar' }, { :message => 'foo bar' }], 2 => [{ :message => 'foo bar' }] }
  def sync
    result = {}
    params[:channel_states].each do |channel_id, first_meep_id|
      channel = Channel.find(channel_id)
      result[channel_id] = Tweet.prepare_for_frontend(channel, channel.tweets.all(:conditions => ["tweets.id > ?", first_meep_id], :order => "tweets.id ASC", :limit => 100, :include => [:avatar]))
    end
    render :json => result
  end

  def new
  end

  def show
    tweet = Tweet.find(params[:id])
    if tweet
      render :partial => 'tweet_list', :locals => {:tweets => [tweet], :channel => Channel.find(tweet.channels.first.id)}
    else
      render :text => ''
    end
  end
  
  def get_before
    tweet = Tweet.find(params[:id])
    count = params[:count]
    # todo...
  end
  
  def create
    channel_id = params[:tweet].delete(:channel_id)
    params[:tweet].reject! {|k,v| !Tweet.valid_attributes.include?(k)}
    
    author = current_user.display_name
    channel_ids = params[:mentioned_channel_ids] ? 
      ([channel_id] | params[:mentioned_channel_ids]) : [channel_id]
    channels = Channel.find(:all, :conditions => ["id in (?)",  channel_ids])
    # current user is nil when not logged in, that's ok
    @tweet = Tweet.new(params[:tweet].merge({:author => author, :user => current_user, :channels => channels}))
    @tweet.save
    
    respond_to do |format|
      format.js  { render :text => @tweet.id }
      format.html { redirect_to :controller => :instruments, :channel_id => channels.first.id }
    end
  end
  
end