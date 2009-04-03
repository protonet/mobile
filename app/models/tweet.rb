class Tweet < ActiveRecord::Base
  
  belongs_to  :user
  has_many    :says
  has_many    :audiences, :through => :says
  
  named_scope :recent, :order => "tweets.id DESC"
  
  # validate_existence_of :audience
  
end
