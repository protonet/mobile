# thanks to http://www.imanel.org/blog/2010/03/cucumber-testing-for-multiple-users-continuation/
# and http://collectiveidea.com/blog/archives/2011/08/04/simultaneous-capybara-sessions-in-cucumber/
# AWESOME!

When /^I am in (.*) browser$/ do |name|
  Capybara.session_name = name
end

When /^(?!I am in)(.*(?= in)) in (.*) browser$/ do |step, name|
  When "I am in #{name} browser"
  And step
end

Given /^I am using the first browser$/ do
  Capybara.session_name = "first"
  sleep 0.5
end

Given /^I am using the second browser$/ do
  Capybara.session_name = "second"
  sleep 0.5
end
