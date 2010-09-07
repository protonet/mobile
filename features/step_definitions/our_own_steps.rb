Then /^wait (\d+) seconds$/ do |seconds|
  sleep seconds.to_i
  true
end

Then /^debug$/ do
  debugger
end

Then /^I wait for the autocompletion$/ do
  sleep 0.5
end

Given /^I am logged in as "([^"]*)"$/ do |username|
  within("#login-form") do
    fill_in 'login', :with => username
    fill_in 'password', :with => '123456'
    click('login')
    sleep 1 # wait for socket
  end
end

Given /^I register as "([^"]*)"$/ do |username|
  within("#registration-form") do
    fill_in 'new-user-login',    :with => username
    fill_in 'new-user-password', :with => '123456'
    click('Join')
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