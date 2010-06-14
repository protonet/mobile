Then /^I should wait$/ do
  sleep 40 # express the regexp above with the code you wish you had
end

Given /^I am logged in as "([^"]*)"$/ do |username|
  within("#login-form") do
    fill_in 'login', :with => username
    fill_in 'password', :with => '123456'
    click('login')
  end
end