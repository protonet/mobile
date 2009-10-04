class Say < ActiveRecord::Base

  belongs_to  :tweet
  belongs_to  :channel
end
