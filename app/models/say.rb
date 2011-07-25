class Say < ActiveRecord::Base

  belongs_to  :meep
  belongs_to  :channel
end
