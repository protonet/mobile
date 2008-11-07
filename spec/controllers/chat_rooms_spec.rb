require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe ChatRooms, "index action" do
  before(:each) do
    dispatch_to(ChatRooms, :index)
  end
end