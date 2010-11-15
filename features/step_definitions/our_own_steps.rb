Then /^wait (\d+) seconds?$/ do |seconds|
  sleep seconds.to_i
  true
end

Then /^debug$/ do
  debugger
end

Then /^I wait for the autocompletion$/ do
  sleep 0.5
end

Given /^I am logged in as "([^\"]*)"(?: with "([^\"]*)")?$/ do|username, password|
  password ||= '123456'
  within("form.login") do
    fill_in 'login_login', :with => username
    fill_in 'login_password', :with => password
    click('login')
    sleep 1 # wait for socket
  end
end

Given /^I register as "([^\"]*)"$/ do |username|
  within("form.sign-up") do
    fill_in 'user_login',    :with => username
    fill_in 'user_password', :with => '123456'
    fill_in 'user_password_confirmation', :with => '123456'
    click('sign up')
  end
end

Then /^the message field should contain "([^\"]*)"$/ do |value|
  with_scope("#message-form") do
    field = find_field("tweet[message]")
    assert_match(/#{value}/, field.value)
  end
end

Given /^"([^"]*)" is listening to "([^"]*)"$/ do |username, channelname|
  User.find_by_login(username).subscribe(Channel.find_by_name(channelname))
end

Given /^I click on "([^"]*)" within "([^"]*)"$/ do |linktext, selector|
  with_scope(selector) do
    find(:xpath, "//a[contains(.,'#{linktext}')]").click
  end
end

Given /^I leave the page$/ do
  visit "http://www.google.com"
end

Given /^I log out$/ do
  visit "/logout"
end

Then /^I should see "([^\"]*)" in the channel list$/ do |channel_name|
  with_scope(".channel-list") do
    assert page.has_xpath?('//*', :text => channel_name, :visible => true)
  end
end

Then /^I should see "([^\"]*)" in the channel details pane$/ do |text|
  with_scope("#channels-details") do
    assert page.has_xpath?('//*', :text => text, :visible => true)
  end
end

Then /^I should see "([^\"]*)" in the timeline$/ do |text|
  with_scope('#timeline') do
    assert page.has_xpath?('//*', :text => text, :visible => true)
  end
end

Then /^I should see the login form$/ do
  assert page.has_xpath?('//form[@action="/users/login"]', :visible => true)
end

Given /^I send the message "([^\"]*)"$/ do |text|
  within('#message-form') do
    fill_in 'message', :with => text
    click_button('submit-message')
  end
end

Then /^I should see one stranger online$/ do
  assert !!find(:css, "#user-widget .stranger")
end

Then /^I should see no strangers online$/ do
  assert !find(:css, "#user-widget .stranger")
end

Then /^I should find "([^\"]*)" on the page$/ do |selector|
  assert !!find(:css, selector)
end

Then /^I should not find "([^\"]*)" on the page$/ do |selector|
  assert !find(:css, selector)
end

Then /^I should be logged in as "([^\"]*)"$/ do |username|
  within('#user-navigation') do
    assert page.has_content?(username)
  end
end

When /^I attach "([^\"]*)" to "([^\"]*)"$/ do |file, field|
  attach_file(field, "#{RAILS_ROOT}/features/upload_files/#{file}")
end

Then /^(?:|I )should see an image with the url "([^\"]*)"(?: within "([^\"]*)")?$/ do |url, selector|
  with_scope(selector) do
    assert page.has_xpath?("//img[starts-with(@src, #{url})]", :visible => true)
  end
end

Given /^administrator rights have not been claimed$/ do
  System::Preferences.admin_set = false
end

Given /^administrator rights have been claimed$/ do
  System::Preferences.admin_set = true
end

Given /^administrator claiming key is "([^\"]*)"$/ do |key|
  System::Preferences.admin_key = key
end

Given /^"([^\"]*)" is an admin$/ do |username|
  user = User.find_by_login(username)
  user.update_attribute(:admin, true)
end