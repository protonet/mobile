Feature: Using the protonet channel management    

  @javascript
  Scenario: Seeing the channel list and it's details
    # Given I go to the start page
    # Given a user exists with login: "dudemeister"
    # And I am logged in as "dudemeister"
    And I go to the channels page
      Then I should see "home" in the channel list
      And I should see "home" in the channel details pane