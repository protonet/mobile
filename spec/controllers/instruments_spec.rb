require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe Instruments, "index action" do
  before(:each) do
    dispatch_to(Instruments, :index)
  end
end