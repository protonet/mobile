class Audience < ActiveRecord::Base

  has_many  :says
  has_many  :tweets, :through => :says
  
  def self.home
    find(1)
  end

end
