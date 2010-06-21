Feature: Using the protonet dashboards multi-user realtime functionalities
  Background:
    Given a user exists with login: "dudemeister"
      And a user exists with login: "batman"
      And a channel exists with name: "cool-channel"
    And I am using the first browser
      And I go to the start page
      And I am logged in as "dudemeister"
    And I am using the second browser
      And I go to the start page
      And I am logged in as "batman"

  @javascript
  Scenario: Writing a meep
    #batman
    Given I am using the second browser
      And I fill in "message" with "Hallo!"
      And I press "submit" within "#message-form"
    #dudemeister
    And I am using the first browser
      Then I should see "Hallo!" within "#feed-holder ul li:first"      