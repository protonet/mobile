require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe Sessions, "#bar" do

  it "should respond correctly" do
      dispatch_to(Sessions, :new).should redirect
  end

end
