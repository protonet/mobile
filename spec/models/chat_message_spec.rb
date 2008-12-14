require File.join( File.dirname(__FILE__), '..', "spec_helper" )

describe ChatMessage, 'saving them' do

  it "should have sanitized the message before saving it" do
    pending
  end
  
  it 'should be possible' do
    message = ChatMessage.new
    assert message.save
  end

end

describe ChatMessage, 'to json method' do
  
  it 'should call to_json on the attributes and return the result' do
    message = ChatMessage.new
    attributes = 'someattributes'
    message.should_receive(:attributes).and_return(attributes)
    attributes.should_receive(:to_json).and_return('foobar')
    assert_equal 'foobar', message.to_json
  end
  
end