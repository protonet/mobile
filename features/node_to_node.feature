Feature: using global channels
  @wip
  Scenario: Connecting to a public channel on another node
    Given there are any global channels
    # Then I click on "discover "
    And I click on "Discover global channels"
    Then I should see the "protonet-devs" global channel
    And I select the "protonet-devs" global channel
    And I click "connect" in the global channel details
    Then I go to the startpage
    Then I should see the global channel "protonet-devs" in the channel list
    And it should be marked as online
    Then I should see the channel with its users and meeps