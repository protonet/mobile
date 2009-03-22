class Tweet < ActiveRecord::Base
  
  belongs_to :user
  has_and_belongs_to_many :audiences
  
  named_scope :recent, :order => "id DESC"
  
end
