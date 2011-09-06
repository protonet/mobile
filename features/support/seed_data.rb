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
    old_driver  = Capybara.current_driver
    Capybara.session_name = "second"
    Capybara.current_driver = :selenium
    # Capybara.current_session.driver.visit("http://blanksite.com/")
    Capybara.current_session.driver.quit
    Capybara.instance_variable_set(:@session_pool, Capybara.send(:session_pool).reject {|k,v| k.match("selenium:second")})
    Capybara.session_name = "first"
    Capybara.current_driver = old_driver
  end
  
  # reset connection tracker
  # `kill -1 #{SystemServices.services["js_dispatching_server"][2].pid}`
end

# AfterStep do
#   if Capybara.send(:session_pool).size > 1
#     old_session = Capybara.session_name
#     old_driver  = Capybara.current_driver
#     Capybara.session_name = "second"
#     Capybara.current_driver = :selenium
#     Capybara.current_session.driver.execute_script("console.log('ping')")
#     Capybara.session_name = old_session
#     Capybara.current_driver = old_driver
#   end
# end