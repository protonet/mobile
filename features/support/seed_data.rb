Before do
  Network.local
  Role.find_or_create_by_title('admin')
  Role.find_or_create_by_title('user')
  Role.find_or_create_by_title('guest')
  User.anonymous
  Channel.home
  System::Preferences.vpn = {:identifier => Network.local.uuid, :password => ActiveSupport::SecureRandom.base64(10)}
end

After do

  $browsers && $browsers.each do |id, browser|
    check_selenium_browsers
    set_selenium_browser(id)
    browser[:session].visit("http://www.google.de") rescue nil
    sleep 0.5
  end

  # reset connection tracker
  # `kill -2 #{System::Services.services["js_dispatching_server"][2].pid}`

end