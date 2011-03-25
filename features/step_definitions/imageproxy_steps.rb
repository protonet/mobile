Given /^an image exists$/ do
  assert true
end

Then /^proxying "([^"]*)" should work$/ do |url|
  # content_type = Mime::Type.lookup_by_extension(url.match(/\/.*\.(.*)$/)[1])
  # assert_equal content_type, open("http://127.0.0.1:#{configatron.nodejs.port}/image_proxy?url=#{url}").content_type
  #cleanup
  `rm #{Rails.root}/public/externals/image_proxy/#{Digest::MD5.hexdigest(url)} 2>&1 > /dev/null`
  request = open("http://127.0.0.1:#{configatron.nodejs.port}/image_proxy?url=#{url}")
  request.content_type.should match(/image/)
  request.status.should == ["200", "OK"]
end

Then /^resizing "([^"]*)" should work$/ do |url|
#cleanup
  `rm #{Rails.root}/public/externals/image_proxy/#{Digest::MD5.hexdigest(url)}_100_100 2>&1 > /dev/null`
  request = open("http://127.0.0.1:#{configatron.nodejs.port}/image_proxy?height=100&width=100&url=#{url}")
  request.content_type.should match(/image/)
  request.status.should == ["200", "OK"]
end

Then /^screenshot resizing "([^"]*)" should work$/ do |url|
  #cleanup
  screenshot = Digest::MD5.hexdigest("http://127.0.0.1:#{configatron.nodejs.port}/screenshooter?url=#{url}")
  `rm #{Rails.root}/public/externals/image_proxy/#{screenshot} 2>&1 > /dev/null`
  `rm #{Rails.root}/public/externals/image_proxy/#{screenshot}* 2>&1 > /dev/null`
  `rm #{Rails.root}/public/externals/screenshots/#{Digest::MD5.hexdigest(url)}-clipped.png 2>&1 > /dev/null`
  
  url = "http://127.0.0.1:#{configatron.nodejs.port}/image_proxy?height=100&width=100&url=http://127.0.0.1:#{configatron.nodejs.port}/screenshooter?url=#{url}"
  request = open(url)
  request.content_type.should match(/image/)
  request.status.should == ["200", "OK"]
end
