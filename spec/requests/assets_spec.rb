require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe "/assets" do
  before(:each) do
    @response = request("/assets")
  end
end