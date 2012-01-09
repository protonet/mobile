Feature: Using global channels
  
  @javascript
  Scenario: Connecting to a public channel on another node
    Given I go to the start page
    And I am logged in as "admin" with password "admin"
    And I click on "channels:overview" in the main navigation
    And I select the global channel "protonet-devs" in the channel overview
    Then I should see "protonet-devs" in the channel details pane
    And I press "Subscribe" within ".subscribe-channel-form"
    Then I should see "admin" in the channel subscriber list
    And I close the lightbox
    Then the channel "protonet-devs" should be remotely connected
    And I select the channel "protonet-devs" from the channel tabs
    And I send the message "ping"
    Then I should see "pong" in the timeline