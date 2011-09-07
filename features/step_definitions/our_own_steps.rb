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
  visit "/users/sign_out"
  find(:css, "body")
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
    click_button('login')
  end
  within('#user-navigation') do
    page.has_content?(username).should == true
  end
end

Given /^I register as "([^\"]*)"$/ do |username|
  within("form.sign-up") do
    fill_in 'user_login',    :with => username
    fill_in 'user_email',    :with => "#{username}@foo.com"
    fill_in 'user_password', :with => '123456'
    fill_in 'user_password_confirmation', :with => '123456'
    click_button('sign up')
  end
  within('#user-navigation') do
    page.has_content?(username).should == true
  end
end

Then /^the message field should contain "([^\"]*)"$/ do |value|
  find("#message-form textarea[name='meep[message]']").native.attribute(:value).should match(/#{value}/)
end

Given /^"([^"]*)" is listening to "([^"]*)"$/ do |username, channelname|
  User.find_by_login(username).subscribe(Channel.find_by_name(channelname))
end

Given /^I click on "([^"]*)" within "([^"]*)"$/ do |linktext, selector|
  find(:css, "#{selector} a", :text => linktext, :visible => true)
end

Given /^I click on the element "([^\"]*)"$/ do |selector|
  find(:css, selector).click
end

Given /^I leave the page$/ do
  visit "http://blanksite.com/"
end

Given /^I log out$/ do
  visit "/users/sign_out"
end

Given /^I select the channel "([^"]*)" in the channel list$/ do |linktext|
  find(:css, "#channels-page a", :text => linktext, :visible => true).click
end

Then /^I should see "([^\"]*)" in the channel list$/ do |channel_name|
  find(:css, '.channel-list li', :text => channel_name, :visible => true)
end

Then /^I should see "([^\"]*)" in the channel details pane$/ do |channel_name|
  find(:css, '#channels-details h3', :text => channel_name, :visible => true)
end

Then /^I verify the user "([^"]*)" for the channel "([^"]*)"$/ do |user_name, channel|
  Given "I select the channel \"#{channel}\" in the channel list"
  user = User.find_by_login(user_name)
  find(:css, "#channel-subscribers li[data-cucumber-user-id='#{user.id}'] a.channel-verify-listener").click
end

Then /^I click verify the user "([^\"]*)" in users list$/ do |user|
  
  with_scope("#channel-subscribers") do
    find(:xpath, "//a[contains(.,'verify listener')]").click
  end
end

Then /^I should not see "([^\"]*)" in the channel selector$/ do |channel_name|
  all(:css, '#channels li', :text => channel_name, :visible => true).empty?.should == true
end

Then /^I should see "([^"]*)" in the channel selector$/ do |channel_name|
  find(:css, '#channels li', :text => channel_name, :visible => true)
end

Then /^I should see "([^\"]*)" in the timeline$/ do |text|
  find(:css, "#timeline li", :text => text, :visible => true)
end

Then /^I click on "([^\"]*)" in the timeline$/ do |text|
  find(:css, "#timeline li", :text => text, :visible => true).click
end

Then /^I should see the login form$/ do
  page.has_xpath?('//form[@action="/users/sign_in"]', :visible => true).should == true
end

Given /^I send the message "([^\"]*)"$/ do |text|
  within('#message-form') do
    fill_in 'message', :with => text
    click_button('submit-message')
  end
end

Then /^wait for socket$/ do
  find(:css, "#user-widget .online")
end

Then /^I should see one stranger online$/ do
  all(:css, "#user-widget .stranger").empty?.should == false
end

Then /^I should see no strangers online$/ do
  all(:css, "#user-widget .stranger").empty?.should == true
end

Then /^I should see "([^\"]*)" online in the user widget$/ do |username|
  find(:css, "#user-widget .stranger").empty?.should == false
end

Then /^I should see "([^\"]*)" online in the user widget$/ do |username|
  all(:css, "#user-widget ul .online", :text => username).empty?.should == false
end

Then /^I should not see "([^\"]*)" online in the user widget$/ do |username|
  all(:css, "#user-widget ul .online", :text => username).empty?.should == true
end

Then /^I should find "([^\"]*)" on the page$/ do |selector|
  all(:css, selector).empty?.should == false
end

Then /^I should not find "([^\"]*)" on the page$/ do |selector|
  all(:css, selector).empty?.should == true
end

Then /^I should be logged in as "([^\"]*)"$/ do |username|
  within('#user-navigation') do
    page.has_content?(username).should == true
  end
end

When /^I attach "([^\"]*)" to "([^\"]*)"$/ do |file, field|
  attach_file(field, "#{Rails.root}/features/upload_files/#{file}")
end

Then /^(?:|I )should see an image with the url "([^\"]*)"(?: within "([^\"]*)")?$/ do |url, selector|
  with_scope(selector) do
    page.has_xpath?("//img[starts-with(@src, #{url})]", :visible => true).should == true
  end
end

Then /^I should see the profile image "([^"]*)" in my profile details$/ do |image_name|
  src = {
    "user_picture.png" => "user_picture.png", #default
    "profile_pic.png"  => "c65d62eccba91b692bd9278e12a6e535"  #user-defined md5'ved
  }[image_name]
  image_selector = "#preferences-details img[src*='#{src}']"
  find(:css, image_selector)
end

Then /^I should see the profile image "([^"]*)" in the top right navi$/ do |image_name|
  src = {
    "user_picture.png" => "user_picture.png", #default
    "profile_pic.png"  => "c65d62eccba91b692bd9278e12a6e535"  #user-defined md5'ved
  }[image_name]
  image_selector = ".welcome img[src*='#{src}']"
  find(:css, image_selector)
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
  SystemPreferences.privacy = {"lo0" => {"allow_registrations_for_strangers" => false}}
end

Given /^"([^\"]*)" is an admin$/ do |login|
  user = User.find_by_login!(login)
  Role.find_or_create_by_title('admin') # ensure the role exists
  user.add_to_role('admin')
end

Given /^(?:|I )store \/([^\/]*)\/ from "([^\"]*)" into "([^\"]*)"$/ do |regexp, selector, variable|
  regexp = Regexp.new(regexp)
  text = find(:css, selector).text.match(regexp).to_a.last
  instance_variable_set("@#{variable}", text)
end

When /^I accept the invitation with the token "([^\"]*)"$/ do |token|
  visit accept_invitation_path(:invitation_token => token)
end

Then /^I should only see my profile settings$/ do
  all(:css, "#preferences-page li").size.should == 1
end

Then /^I should see all settings$/ do
  all(:css, "#preferences-page li").size.should == 11
end

Given /^I start a rendezvous chat with "([^"]*)"$/ do |username|
  within('#user-widget') do
    find(:xpath, "//a[contains(.,'#{username}')]").click
  end
  find(:css, ".context-menu-users li", :text => 'start private chat').click
end

Then /^I should see a channel for "([^"]*)"$/ do |channelname|
  find(:css, '#channels li', :text => channelname)
end

Then /^I should not see a channel for "([^"]*)"$/ do |channelname|
  all(:css, "#channel li", :text => channelname).empty?.should == true
end

Then /^I close the rendezvous channel for "([^"]*)"$/ do |username|
  find(:css, '#channels li', :text => username).find(:css, 'span.hide-link').click
end

Then /^the protonet channel "([^"]*)" should be active$/ do |channelname|
  find(:css, '#channels li a.active', :text => channelname)
end

Then /^I switch to the channel "([^"]*)"$/ do |channelname|
  find(:css, '#channels li a', :text => channelname).click
end

