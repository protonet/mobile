Feature: Using the protonet channel management

  @javascript
  Scenario: Seeing the channel list and it's details
  Given a user exists with login: "dudemeister"
  And I go to the start page    
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

  @wip
  Scenario: Trying to subscribe to a private channel
