require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe "/asset_lists" do
  before(:each) do
    @response = request("/asset_lists")
  end
end