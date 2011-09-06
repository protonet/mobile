Before do
  load Rails.root + "db/seeds.rb"
  # we're adding lo for hudson
  SystemPreferences.defaults[:privacy] = {
    "lo0" => {
      "allow_dashboard_for_strangers" => true,
      "allow_registrations_for_strangers" => true
    },
    "lo" => {
      "allow_dashboard_for_strangers" => true,
      "allow_registrations_for_strangers" => true
    }
  } 
end

After do
  if Capybara.send(:session_pool).size > 1
    old_session = Capybara.session_name
    Capybara.session_name = "second"
    Capybara.current_session.driver.visit("http://blanksite.com/")
    Capybara.session_name = old_session
  end
  
  # reset connection tracker
  # `kill -1 #{SystemServices.services["js_dispatching_server"][2].pid}`
end

AfterStep do
  if Capybara.send(:session_pool).size > 1
    old_session = Capybara.session_name
    Capybara.session_name = "second"
    Capybara.current_session.driver.execute_script("console.log('ping')")
    Capybara.session_name = old_session
  end
end