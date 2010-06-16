class Tweet < ActiveRecord::Base
  
  belongs_to  :user
  has_many    :says
  has_many    :channels,  :through => :says
  has_one     :avatar,    :through => :user
  
  named_scope :recent, :order => "tweets.id DESC"
  validates_presence_of :message
  
  attr_accessor :socket_id
  # validate_existence_of :channel
  
  after_create :send_to_queue if Rails.env == 'production' || configatron.messaging_bus_active == true
  
  def text_extension?
    !text_extension.blank?
  end
  
  def self.find_tweets_older_than(channel, last_id)
    new_tweets = []
    reset_wrapper_variables
    tweets = channel.tweets.all(:conditions => ["tweets.id < ?", last_id], :order => "tweets.id DESC", :limit => 25)
    tweets.each_with_index do |t, i|
      show_wrapper_start, show_wrapper_end, first_index, last_index = calculate_wrappers(tweets, t, i)
      next if i != first_index
      new_tweets << {tweets[first_index].user => tweets[first_index..last_index]}
    end
    new_tweets
  end
  
  def self.reset_wrapper_variables
    @first_post_in_a_merge = false
    @last_post_in_a_merge  = false
    @showed_wrapper_start  = false
    @showed_wrapper_end    = false
    @merging               = false
  end
  
  def self.calculate_wrappers(tweets, t, i)
    same_poster_as_next = (t.user.id == (tweets[i + 1] && tweets[i + 1].user.id))
    
    @merging = true if same_poster_as_next && !t.text_extension?
  
    @first_post_in_a_merge = @merging && !@showed_wrapper_start
    @first_index = i if !@merging || @first_post_in_a_merge
    @showed_wrapper_start  = true if @first_post_in_a_merge
  
    @last_post_in_a_merge  = @merging && (!same_poster_as_next || t.text_extension?)
  
    @show_wrapper_start = !@merging || @first_post_in_a_merge
    @show_wrapper_end   = !@merging || @last_post_in_a_merge
    
    last_tweet= if @first_post_in_a_merge
      cut_tweet = nil
      tweets[(i + 1)..25].each do |innertweet|
        if innertweet.user.id == t.user.id && innertweet.text_extension?
          cut_tweet = innertweet
          break
        end
        (cut_tweet = tweets[tweets.index(innertweet) - 1] and break) if innertweet.user.id != t.user.id
      end
      cut_tweet ||= tweets.last
    else
      t
    end
    @last_index = tweets.index(last_tweet)


    @merging              = false if @last_post_in_a_merge
    @show_wrapper_start   = false if @last_post_in_a_merge
    @showed_wrapper_start = false if @last_post_in_a_merge
    
    [@show_wrapper_start, @show_wrapper_end, @first_index, @last_index]
  end
  
  
  def send_to_queue
    channels.each do |channel|
      System::MessagingBus.topic('channels').publish(self.attributes.merge({
        :socket_id => socket_id,
        :channel_id => channel.id,
        :user_icon_url => user.active_avatar_url
        }).to_json, :key => 'channels.' + channel.id.to_s)
    end
  end
  
end
