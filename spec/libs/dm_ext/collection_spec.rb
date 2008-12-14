require File.join( File.dirname(__FILE__), '../..', "spec_helper" )

describe "The dm_ext collection to_json extension" do
  
  before(:all) do
    User.all.destroy!
    @users = 3.of {User.gen}
    @collection = User.all
  end

  it "should add a to_json method to dm collections" do
    @collection.respond_to?(:to_json)
  end
  
  it "the to_json method should accept an argument and forward it to the attributes methods of the objects" do
    @collection.each do |u|
      u.should_receive(:attributes).with('foo').and_return('foo')
    end
    @collection.to_json('foo')
  end
  
  it "should call to_json on the attributes" do
    @collection.each do |u|
      object = 'foo'
      u.should_receive(:attributes).and_return(object)
      object.should_receive(:to_json).and_return('{json: "blub"}')
    end
    @collection.to_json
  end
  
  it "should create an array of json objects out of it" do
    @collection.each do |u|
      object = 'foo'
      u.should_receive(:attributes).and_return(object)
      object.should_receive(:to_json).and_return('{json: "blub"}')
    end
    assert_equal "[{json: \"blub\"},{json: \"blub\"},{json: \"blub\"}]", @collection.to_json
  end

end
