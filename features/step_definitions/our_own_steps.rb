Given /^an? ([^"]*) with the login "([^\"]*)"$/ do |role_name, login|
  user = Factory(:user, :login => login, :email => "#{login}@protonet.com")
  user.add_to_role(role_name)
end

Given /^a channel named "([^\"]*)"$/ do |channel_name|
  #Channel.create(:owner => User.find(1), :name => channel_n)
  channel = Factory(:channel, :name => channel_name)
end

Then /^I wait (\d+) seconds?$/ do |seconds|
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

Given /^I visit "(.*)"$/ do |url|
  visit url
end

# When /^(?:|I )go to (.+)$/ do |page_name|
#   visit path_to(page_name)
#   sleep 1
# end

Then /^I wait for the autocompletion$/ do
  sleep 0.5
end

Given /^I am logged in as "([^\"]*)"(?: with password "([^\"]*)")?$/ do|username, password|
  password ||= (@password || '123456')
  within("form.login") do
    fill_in 'login_login', :with => username
    fill_in 'login_password', :with => password
    click_button('login')
  end

  wait_until(10) do
    page.has_css?("#my-widget")
  end

  within('#my-widget') do
    page.has_content?(username.gsub("@protonet.com", "")).should == true
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
  within('#my-widget') do
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

Given /^I select the channel "([^\"]*)" in the channel list$/ do |linktext|
  selector = "a[data-tab='channels'] strong"

  wait_until(10) do
    page.has_css?(selector)
  end

  find(:css, selector, :text => "@#{linktext}", :visible => true).click
end

Given /^I select the global channel "([^\"]*)" in the channel overview$/ do |linktext|
  selector = "output[data-recommended-global-channels] ul a h4"

  wait_until(10) do
    page.has_css?(selector)
  end

  find(:css, selector, :text => "#{linktext}", :visible => true).click
end

Given /^I select the channel "([^\"]*)" in the channel overview$/ do |linktext|
  find(:css, ".channel-teaser a", :text => "@#{linktext}", :visible => true).click
end

Then /^I should see "([^\"]*)" in the channel list$/ do |channel_name|
  find(:css, 'a[data-tab="channels"] strong', :text => "@#{channel_name}", :visible => true)
end

Then /^I should see "([^\"]*)" in the channel details pane$/ do |channel_name|
  find(:css, 'output[data-tab="channels"] h2', :text => "@#{channel_name}", :visible => true)
end

Given /^I select the channel "([^\"]*)" from the channel tabs$/ do |linktext|
  find(:css, "#channels a", :text => "#{linktext.humanize}", :visible => true).click
end

Then /^I verify the user "([^"]*)" for the channel "([^"]*)"$/ do |user_name, channel|
  Given "I select the channel \"#{channel}\" in the channel list"
  user = User.find_by_login(user_name)
  find(:css, "li[data-cucumber='#{user.id}'] a[data-cucumber='verify']").click
end

Then /^I should not see "([^\"]*)" in the channel selector$/ do |channel_name|
  all(:css, '#channels li', :text => channel_name, :visible => true).empty?.should == true
end

Then /^I should see "([^\"]*)" in the channel selector$/ do |channel_name|
  find(:css, '#channels li', :text => channel_name, :visible => true)
end

Then /^I should see "([^\"]*)" in the timeline$/ do |text|
  find(:css, "#timeline li", :text => text, :visible => true)
end

Then /^I click on "([^\"]*)" in the timeline$/ do |text|
  find(:css, "#timeline li", :text => text, :visible => true).click
end

Then /^I should see the login form$/ do
  find(:css, 'form.login', :visible => true)
end

Then /^I should see the registration form$/ do
  find(:css, 'form.sign-up', :visible => true)
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
  within('#my-widget') do
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

Then /^I should see the profile image "([^\"]*)" in my profile details$/ do |image_name|
  src = {
    "user_picture_r4.png" => "user_picture_r4.png", #default
    "profile_pic.png"  => "c65d62eccba91b692bd9278e12a6e535"  #user-defined md5'ved
  }[image_name]

  wait_until(20) do
    page.has_css?(".users-page .user-avatar[src*='#{src}']")
  end
end

Then /^I should see the profile image "([^\"]*)" in the top right navi$/ do |image_name|
  src = {
    "user_picture_r4.png" => "user_picture_r4.png", #default
    "profile_pic.png"  => "c65d62eccba91b692bd9278e12a6e535"  #user-defined md5'ved
  }[image_name]

  wait_until(20) do
    find(:css, "#my-widget img[src*='#{src}']")
  end
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

Then /^I should see all settings$/ do
  all(:css, "a[data-tab='preferences']").size.should == 8
end

Given /^I start a rendezvous chat with "([^\"]*)"$/ do |username|
  within('#user-widget') do
    find(:xpath, "//a[contains(.,'#{username}')]").click
  end
  find(:css, ".context-menu-users li", :text => 'start private chat').click
end

Then /^I should see a channel for "([^\"]*)"$/ do |channelname|
  find(:css, '#channels li', :text => channelname)
end

Then /^I should not see a channel for "([^\"]*)"$/ do |channelname|
  all(:css, "#channel li", :text => channelname).empty?.should == true
end

Then /^I close the rendezvous channel for "([^\"]*)"$/ do |username|
  find(:css, '#channels li', :text => username).find(:css, 'span.hide-link').click
end

Then /^the protonet channel "([^\"]*)" should be active$/ do |channelname|
  find(:css, '#channels li a.active', :text => channelname)
end

Then /^I switch to the channel "([^\"]*)"$/ do |channelname|
  find(:css, '#channels li a', :text => channelname).click
end

Then /^I visit the profile of "([^\"]*)"$/ do |username|
  visit "/users/search?search_term=#{username}&id=1"
end

Then /^"([^\"]*)" should be an admin$/ do |username|
  User.find_by_login(username).admin?
end

Then /^I should see the getting started box containing (\d+) steps$/ do |step_size|
  all(:css, '.getting-started li', :visible => true).size.should == step_size.to_i
end

Then /^I should not see the getting started box$/ do
  wait_until(10) do
    !page.has_css?('.getting-started')
  end
end

Then /^I follow the getting started "([^\"]*)" link$/ do |link_name|
  find(:css, ".#{link_name.gsub(/\s/, '-')} a", :visible => true).click
end

Then /^I should see the modal window$/ do
  find(:css, ".modal-window", :visible => true)
end

Then /^I close the modal window$/ do
  find(:css, ".modal-window .close-link", :visible => true).click
end

Then /^I should not see the modal window$/ do
  all(:css, '.modal-window', :visible => true).empty?.should == true
end

Then /^I should see "([^\"]*)" marked as done in the getting started box$/ do |link_name|
  find(:css, ".getting-started .#{link_name.gsub(/\s/, '-')}.done", :visible => true)
end

Then /^I close the getting started box$/ do
  find(:css, ".getting-started-close-link", :visible => true).click
end

# channels-controller-link

Given /^I click on "([^\"]*)" in the main navigation$/ do |link_name|
  first, second = link_name.split(":")
  find(:css, ".#{first}-controller-link").click
  find(:css, ".#{first}-controller-link .sub-nav-link a", :text => second.humanize).click if second
end

Then /^I should see "([^\"]*)" in the channel subscriber list$/ do |username|
  find(:css, ".subscribers-list", :text => username)
end

Then /^I close the lightbox$/ do
  find(:css, "header .logo a").click
end

Then /^the channel "([^\"]*)" should be remotely connected$/ do |arg1|
  find(:css, ".global").native["class"] == "global" # and not offline
end

Then /^I subscribe the user "([^\"]*)"$/ do |user_identifier|
  within(".subscribe-user") do
    fill_in 'search_term',    :with => user_identifier
    sleep 0.2
    click_button('Subscribe')
  end
end

Then /^I should see the invitation page$/ do
  find(:css, "h2", :text => "Invite people")
end

Then /^I invite "([^\"]*)" to channel "([^\"]*)" with token "([^\"]*)" as "([^\"]*)"/ do |email, channel_name, token, user_name|
  Invitation.create(
    :token => token,
    :email => email,
    :channel_ids => Channel.find_by_name(channel_name).id,
    :user => User.find_by_login(user_name)
  )
end

Then /^somebody accepts the invitation with token "([^\"]*)"/ do |token|
  Invitation.find_by_token(token).update_attribute("accepted_at", "2011-01-15 10:00:00")
end