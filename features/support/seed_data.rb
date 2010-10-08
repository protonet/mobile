Before do
  
  Network.local
  User.anonymous
  Channel.home
  System::Preferences.vpn = {:identifier => '12345678', :password => 'vpnpassword'}

end

After do

  # reset connection tracker
  `kill -2 #{System::Services.services["js_dispatching_server"][2].pid}`
  sleep 0.5

end