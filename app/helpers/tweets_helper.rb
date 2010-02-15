module TweetsHelper
  def reset_wrapper_variables
    @first_post_in_a_merge = false
    @last_post_in_a_merge  = false
    @showed_wrapper_start  = false
    @showed_wrapper_end    = false
    @merging               = false
  end
  
  def calculate_wrappers(tweets, t, i)
    same_poster_as_next = (t.user.id == (tweets[i + 1] && tweets[i + 1].user.id))
  
    @merging = true if same_poster_as_next && !t.text_extension?
  
    @first_post_in_a_merge = @merging && !@showed_wrapper_start
    @showed_wrapper_start  = true if @first_post_in_a_merge
  
    @last_post_in_a_merge  = @merging && (!same_poster_as_next || t.text_extension?)
  
    @show_wrapper_start = !@merging || @first_post_in_a_merge
    @show_wrapper_end   = !@merging || @last_post_in_a_merge
    
    @last_id = if @first_post_in_a_merge
      cut_tweet = nil
      tweets[(i + 1)..25].each do |innertweet| 
        (cut_tweet = innertweet and break) if innertweet.user.id == t.user.id && innertweet.text_extension?
        (cut_tweet = tweets[tweets.index(innertweet) - 1] and break) if innertweet.user.id != t.user.id
      end
      cut_tweet ||= tweets.last
    else
      t
    end.id

    @merging              = false if @last_post_in_a_merge
    @show_wrapper_start   = false if @last_post_in_a_merge
    @showed_wrapper_start = false if @last_post_in_a_merge
    
    [@show_wrapper_start, @show_wrapper_end, @last_id]
  end
end
