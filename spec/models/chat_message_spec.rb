require File.join( File.dirname(__FILE__), '..', "spec_helper" )

describe ChatMessage, 'saving them' do

  it "should have sanitized the message before saving it" do
    pending
  end
  
  it 'should be possible' do
    message = ChatMessage.new
    message.save
  end

end

describe ChatMessage, 'to json method' do
  
  it 'should convert all attributes to json' do
    pending
  end
  
end