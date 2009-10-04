class Channel < ActiveRecord::Base

  has_many  :says
  has_many  :tweets, :through => :says

  has_many  :listens
  has_many  :users, :through => :listens

  
  def self.home
    begin
      find(1)
    rescue ActiveRecord::RecordNotFound
      Channel.new(:id => 1, :name => 'home', :description => 'your homebase - your node :)').save && find(1)
    end
  end

end
