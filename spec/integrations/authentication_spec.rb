require File.dirname(__FILE__) + '/../spec_helper'

describe "Authentication" do

  before(:each) do
    sign_out
  end

  it 'should redirect to sign_in page' do
    visit "/mobile"
    current_path.should == "/mobile/sign_in"
  end

  describe "login" do

    it 'should show error on invalid credentials', :js => true do
      sign_in "admin", "falsepw"
      wait_until{
        !page.has_selector?('.ui-loading')
      }
      page.should have_content("Your credentials are invalid")
    end
    
    it 'should login with a valid account', :js => true do
      sign_in "admin", "admin"
      wait_for_channel_list
      page.should have_content("Sign out")
      current_path.should == "/mobile"
    end

    it 'should login app aswell', :js => true do
      sign_in "admin", "admin"
      wait_for_channel_list
      click_link("normal Version")
      within ".widget-list" do
        page.should have_content("admin")
      end
    end

  end

  describe "reset password" do

    it 'should reset your password', :js => true do
      visit "/mobile/sign_in"
      click_link "reset it here"
      fill_in "Type in your email", :with => "admin@protonet.local"
      click_button "Reset"
      wait_until(10){
        !page.has_selector?('.ui-loading')
      }
      page.should have_content("You will recieve an email how to reset your password")
    end

  end


end