require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe ChatUsers, "index action" do
  before(:each) do
    dispatch_to(ChatUsers, :index)
  end
end