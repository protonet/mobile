Feature: Using the protonet channel management

  @javascript
  Scenario: Seeing the channel list and it's details
    Given I go to the start page
    Given a user with the login "dudemeister"
    And I am logged in as "dudemeister"
    And I go to the channels page
      Then I should see "home" in the channel list
      And I should see "home" in the channel details pane

  @wip
  Scenario: Creating and making a channel private
    Given a user exists with login: "dudemeister"
    And I go to the start page
    And I am logged in as "dudemeister"
    And I go to the channels page
      Then I create a channel
      Then I select that channel
      Then make it private


  @javascript
  Scenario: Trying to subscribe to a private channel
    Given a user exists with login: "dudemeister"
      And a user exists with login: "batman"    
    #dudemeister creates channel
    And I am using the first browser
      And go unauthenticated to the start page
      And I am logged in as "dudemeister"
      And I go to the channels page
      And follow "create a channel"
      And I fill in "channel_name" with "privatechannel"
      And press "Create"
      # within "#channels-page"
      And I uncheck "channel_public"
      And press "Save"
    #batman starts listening private channel
        And I am using the second browser
        And go unauthenticated to the start page
        And I am logged in as "batman"
        And I go to the channels page
        And I click on "privatechannel" within "#channels-page"
        # need to wait for appearance of listen in chanels-details
        And wait 1 seconds 
        Then I click on the element "#channels-details .listen p"
        Then I go to the start page
        Then I should not see "Privatechannel" in the channel selector list
    #dudemeister verifies batman
          And I am using the first browser
          And I go to the channels page
            Then I click on "privatechannel" within "#channels-page"
            Then I click verify user "batman" in users list
    #batman goes start page checks channel appears
              And I am using the second browser
              And I go to the start page
                Then I should see "Privatechannel" in the channel selector list
  