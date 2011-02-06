Feature: Using the protonet image proxy

  Scenario: Proxying a normal image
    Then proxying "http://www.20thingsilearned.com/css/images/front-cover.jpg" should work
    
  Scenario: Proxying a https image
    Then proxying "https://encrypted.google.com/images/logos/ssl_logo_lg.gif" should work
    
  Scenario: Proxying an image found by redirection
    Then proxying "http://0.gravatar.com/avatar/8a1bd3731a98c23b515efa479143628a?s=70&d=http%3A%2F%2F0.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D70&r=G" should work
    
  Scenario: Proxying a big image
    Then proxying "http://www.swainplating.com/images/dsc_0083.jpg" should work
    
  Scenario: Proxying an animated gif
    Then proxying "http://media.ebaumsworld.com/picture/mzeBONE/BackToTheFutureII.gif" should work
    
  @wip
  Scenario: Proxying a local image
    # you'll need to login first upload an image and then have it published
    Then proxying "http://localhost/foobar" should work
    
  @wip
  Scenario: Proxying a local https image
    # you'll need to login first upload an image and then have it published
    Then proxying "https://localhost/foobar" should work
    
  Scenario: Resizing
    Then resizing "http://media.ebaumsworld.com/picture/mzeBONE/BackToTheFutureII.gif" should work
    
  Scenario: Resizing a screenshot
    Then screenshot resizing "http://www.google.de" should work
    
  @wip
  Scenario: Proxying an image that causes webkit2png errors
    Then screenshooting "foobar" should not work
    
  @wip
  Scenario: Screenshooting problematic pages
    Then screenshooting "http://soundcloud.com/" should work