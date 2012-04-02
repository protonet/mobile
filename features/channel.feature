Feature: Using the protonet channel management

  @javascript
  Scenario: Seeing the channel list and it's details
    Given I go to the start page
    Given a user with the login "dudemeister"
    And I am logged in as "dudemeister"
    And I go to the channels page
    And I follow "Browse channels"
      Then I should see "home" in the channel list
      And I select the channel "home" in the channel list
      And I should see "home" in the channel details pane

  @javascript
  Scenario: Trying to subscribe to a private channel
    Given a user exists with login: "dudemeister"
      And a user exists with login: "batman"    
    #dudemeister creates channel
    And I am using the first browser
      And go unauthenticated to the start page
      And I am logged in as "dudemeister"
      And I go to the channels page
      And follow "Create new"
      And I fill in "channel_name" with "privatechannel"
      And press "Create"
      And I uncheck "channel_public"
    #batman starts listening private channel
        And I am using the second browser
        And go unauthenticated to the start page
        And I am logged in as "batman"
        And I go to the channels page
        And I follow "Browse channels"
        And I select the channel "privatechannel" in the channel list
        Then I press "Subscribe" within ".subscribe-channel-form"
        Then I go to the start page
        Then I should not see "Privatechannel" in the channel selector
    #dudemeister verifies batman
          And I am using the first browser
          And I visit "/"
          And I switch to the channel "Privatechannel"
          Then I should see "1 pending verification"
          And I follow "1 pending verification"
            Then I verify the user "batman" for the channel "privatechannel"
    #batman goes start page checks channel appears
              And I am using the second browser
              And I go to the start page
                Then I should see "Privatechannel" in the channel selector

  @javascript
  Scenario: Subscribing an user to a channel
    Given I go to the start page
    Given a user with the login "dudemeister"
    Given a channel exists with name: "somechannel"
    And I am logged in as "admin" with password "admin"
    And I go to the channels page
    And I follow "Browse channels"
    Then I should see "somechannel" in the channel list
    And I select the channel "somechannel" in the channel list
    And I subscribe the user "dudemeister"
    Then I should see "dudemeister" in the channel subscriber list
    And I subscribe the user "foo@bar.com"
    Then I should see the invitation page
