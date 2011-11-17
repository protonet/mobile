Feature: Using global channels
  
  @wip
  Scenario: Connecting to a public channel on another node
    Given a user with the login "dudemeister"
    Then I should see the global channels tab
    And I should see the "protonet-devs" global channel
    And I should see the "protonet-support" global channel
    And I click "protonet-devs" in "XYZ"
    Then I should have selected "protonet support" on the "protonet team" node
    And I hit subscribe
    And I close the channel tab
    Then I should see the channel "protonet-devs" in my channel list
    And the channel "protonet-devs" should be remotely connected
    And I click on "protonet-devs" in the channel list
    And write a message "xyz"
    Then I should see a message "foobar returned from global"
    And the message should have the bots avatar