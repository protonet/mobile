Before do
  DatabaseCleaner.start
  Network.local
  User.anonymous
  Channel.home
  System::Preferences.vpn = {:identifier => '12345678', :password => 'vpnpassword'}
  
end