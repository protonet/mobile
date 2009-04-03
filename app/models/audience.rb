class Audience < ActiveRecord::Base

  has_many  :says
  has_many  :tweets, :through => :says

  has_many  :listens
  has_many  :users, :through => :listens

  
  def self.home
    find(1)
  end

end
