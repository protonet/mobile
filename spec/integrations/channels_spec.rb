require File.dirname(__FILE__) + '/../spec_helper'

describe "Channels" do

  before(:all) do
    sign_out
    sign_in "admin", "admin"
  end

  def show_channel(pagelink)
     wait_until{ !page.has_selector?(".ui-loading") }
     page.find(".channel-link", :text => pagelink).click
     wait_until{ page.has_selector?(".channel-page") }
  end

  it "should show channels" do
    page.should have_selector(".channel-link")
  end

  it "should show channel page" do
    show_channel("home")
  end

  it "should write a meep" do
    show_channel("home")
    text = "The time is: #{Time.now}"
    fill_in "meep_message", :with => text
    click_button "Send"
    page.should have_content(text)
  end

end