Given /^an? ([^"]*) with the login "([^"]*)"$/ do |role_name, login|
  user = Factory(:user, :login => login, :email => "#{login}@protonet.com")
  user.add_to_role(role_name)
end

Then /^wait (\d+) seconds?$/ do |seconds|
  sleep seconds.to_i
  true
end

Then /^debug$/ do
  debugger
end

When /^(?:|I )go unauthenticated to the start page$/ do
  visit "/logout"
  sleep 1
end

# When /^(?:|I )go to (.+)$/ do |page_name|
#   visit path_to(page_name)
#   sleep 1
# end

Then /^I wait for the autocompletion$/ do
  sleep 0.5
end

Given /^I am logged in as "([^\"]*)"(?: with "([^\"]*)")?$/ do|username, password|
  password ||= (@password || '123456')
  within("form.login") do
    fill_in 'login_login', :with => username
    fill_in 'login_password', :with => password
    click('login')
  end
  within('#user-navigation') do
    assert page.has_content?(username)
  end
end

Given /^I register as "([^\"]*)"$/ do |username|
  within("form.sign-up") do
    fill_in 'user_login',    :with => username
    fill_in 'user_password', :with => '123456'
    fill_in 'user_password_confirmation', :with => '123456'
    click('sign up')
  end
  within('#user-navigation') do
    assert page.has_content?(username)
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

Given /^I click on the element "([^\"]*)"$/ do |selector|
  find(:css, selector).click
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

Then /^I click verify user "([^\"]*)" in users list$/ do |user|
  with_scope("#channel-subscribers") do
    find(:xpath, "//a[contains(.,'verify listener')]").click
  end
end

Then /^I should not see "([^\"]*)" in the channel selector list$/ do |channel_name|
  with_scope("#channels") do
    assert !page.has_xpath?('//*', :text => channel_name)
  end
end

Then /^I should see "([^"]*)" in the channel selector list$/ do |channel_name|
  with_scope("#channels") do
    assert page.has_xpath?('//*', :text => channel_name, :visible => true)
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
  attach_file(field, "#{Rails.root}/features/upload_files/#{file}")
end

Then /^(?:|I )should see an image with the url "([^\"]*)"(?: within "([^\"]*)")?$/ do |url, selector|
  with_scope(selector) do
    assert page.has_xpath?("//img[starts-with(@src, #{url})]", :visible => true)
  end
end

Then /^I should see the image "([^"]*)"(?: within "([^"]*)")?$/ do |image_name, selector|
  image_selector = "img[src*='#{image_name}']"
  with_scope(selector) do
    if page.respond_to? :should
      page.should have_css(image_selector)
    else
      assert page.has_css?(image_selector)
    end
  end
end

Given /^administrator rights have not been claimed$/ do
  SystemPreferences.admin_set = false
end

Given /^administrator rights have been claimed$/ do
  SystemPreferences.admin_set = true
end

Given /^administrator claiming key is "([^\"]*)"$/ do |key|
  SystemPreferences.admin_key = key
end

Given /^strangers are not allowed to register$/ do
  SystemPreferences.allow_registrations_for_strangers = false
end

Given /^"([^\"]*)" is an admin$/ do |login|
  user = User.find_by_login!(login)
  Role.find_or_create_by_title('admin') # ensure the role exists
  user.add_to_role('admin')
end

Given /^(?:|I )store \/([^\/]*)\/ within "([^\"]*)" into "([^\"]*)"$/ do |regexp, selector, variable|
  regexp = Regexp.new(regexp)
  text = find(:css, selector).text.match(regexp).to_a.last
  instance_variable_set("@#{variable}", text)
end

When /^I accept the invitation with the token "([^\"]*)"$/ do |token|
  visit accept_invitation_path(:invitation_token => token)
end
