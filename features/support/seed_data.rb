Before do
  
  Network.local
  User.anonymous
  Channel.home
  System::Preferences.vpn = {:identifier => '12345678', :password => 'vpnpassword'}

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