Before do
  
  Network.local
  User.anonymous
  Channel.home
  System::Preferences.vpn = {:identifier => '12345678', :password => 'vpnpassword'}

end

After do

  # reset connection tracker
  `killall -2 js_dispatcher_cucumber`
  sleep 0.5

end