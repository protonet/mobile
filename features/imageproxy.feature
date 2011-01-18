Feature: Using the protonet image proxy

  Scenario: Proxying a normal image
    Given an image exists
    Then Proxying "http://www.20thingsilearned.com/css/images/front-cover.jpg" should work
    
  Scenario: Proxying a https image
    Given an image exists
    Then Proxying "https://www.xing.com/img/n/nobody_f_s2.png" should work
    
  Scenario: Proxying an image found by redirection
    Given an image exists
    Then Proxying "http://0.gravatar.com/avatar/8a1bd3731a98c23b515efa479143628a?s=70&d=http%3A%2F%2F0.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D70&r=G" should work
    
  Scenario: Proxying a big image should work
    Given an image exists
    Then Proxying "http://www.swainplating.com/images/dsc_0083.jpg"
    
  Scenario: Proxying a local image
    Given an image exists
    Then Proxying "http://localhost/foobar" should work
    
  Scenario: Proxying a local https image
    Given an image exists
    Then Proxying "https://localhost/foobar" should work
    
  Scenario: Resizing should work
    Given an image exists
    Then Resizing "foobar" should work
    
  Scenario: Resizing a screenshot should work
    Given an image exists
    Then Resizing "screenshot address" should work