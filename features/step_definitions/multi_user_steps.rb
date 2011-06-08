# thanks to http://www.imanel.org/blog/2010/03/cucumber-testing-for-multiple-users-continuation/
# AWESOME!

def check_selenium_browsers
  Capybara.instance_variable_set('@current_driver', :selenium)
  if $browsers.nil?
    $browsers = {}
    current_url
    $browsers[1] = get_selenium_browser
    set_selenium_browser(nil)
    current_url
    $browsers[2] = get_selenium_browser
    set_selenium_browser(1)
  end
end

def get_selenium_browser
  {
    :session => Capybara.current_session,
    :driver  => Capybara::Driver::Selenium.instance_variable_get('@driver')
  }
end

def set_selenium_browser(browser_id)
  browser = $browsers[browser_id] || {}
  if browser[:session].nil?
    Capybara.instance_variable_set('@session_pool', {})
    Capybara::Driver::Selenium.instance_variable_set('@driver', nil)
  else
    Capybara.instance_variable_set('@session_pool', {"selenium#{Capybara.app.object_id}" => browser[:session]})
    Capybara::Driver::Selenium.instance_variable_set('@driver', browser[:driver])
  end
end

Given /^I am using the first browser$/ do
  sleep 1
  check_selenium_browsers
  set_selenium_browser(1)
  sleep 1
end

Given /^I am using the second browser$/ do
  sleep 1
  check_selenium_browsers
  set_selenium_browser(2)
  sleep 1
end
