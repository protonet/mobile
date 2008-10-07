require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')
require File.join(File.dirname(__FILE__), '../../lib/backend_adapters', 'development_mock.rb')

describe "The development mocks get_ips_of_currently_connected_clients method" do

  before(:each) do
    @backend = BackendAdapters::DevelopmentMock.new
  end
  
  it "should return its info data" do
    @backend.info.should == "development mock" # ;) yeah I know its not much right now
  end

  it "should return a list of 5 ips" do
    ips = @backend.get_ips_of_currently_connected_clients
    ips.size.should == 5
    ips.each do |ip|
      ip.should match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)
    end
  end

end
