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

Given /^I am logged in as "([^\"]*)"$/ do |username|
  within("form.login") do
    fill_in 'login_login', :with => username
    fill_in 'login_password', :with => '123456'
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
  assert page.has_xpath?('//form[@action="/session"]', :visible => true)
end

Given /^I send the message "([^\"]*)"$/ do |text|
  within('#message-form') do
    fill_in 'message', :with => text
    click_button('submit-message')
  end
end

Then /^I should see one stranger online$/ do
  assert find(:css, "#user-widget .stranger")
end

Then /^I should see no strangers online$/ do
  assert !find(:css, "#user-widget .stranger")
end