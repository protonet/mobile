class Audience < ActiveRecord::Base

  has_many  :tweets, :through => :says
  
  def self.home
    find(0)
  end

end
