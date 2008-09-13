require File.join( File.dirname(__FILE__), '..', "spec_helper" )

describe Room, 'lobby functionality' do
  
  before(:all) do
    # remove the lobby if it exists
    (r = Room.get(1)) && r.destroy
  end

  it "should return or create the lobby" do
    Room.get(1).should == nil
    Room.lobby.should == Room.get(1)
    Room.lobby
    Room.all.size.should == 1
  end

end