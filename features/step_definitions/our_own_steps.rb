Then /^I should wait$/ do
  debugger
  true
end

Then /^I wait for the autocompletion$/ do
  sleep 0.5
end

Given /^I am logged in as "([^"]*)"$/ do |username|
  within("#login-form") do
    fill_in 'login', :with => username
    fill_in 'password', :with => '123456'
    click('login')
  end
end

Then /^the message field should contain "([^\"]*)"$/ do |value|
  with_scope("#message-form") do
    field = find_field("tweet[message]")
    assert_match(/#{value}/, field.value)
  end
end
