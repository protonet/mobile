Feature: Using the protonet dashboards multi-user realtime functionalities

  @javascript
  Scenario: Writing a meep
    Given a user exists with login: "dudemeister"
      And a user exists with login: "batman"
      And a channel exists with name: "cool-channel"
    And I am using the first browser
      And I go to the start page
      And I am logged in as "dudemeister"
    And I am using the second browser
      And I go to the start page
      And I am logged in as "batman"
    #batman
    Given I am using the second browser
      And I fill in "message" with "Hallo!"
      And I press "submit" within "#message-form"
    #dudemeister
    And I am using the first browser
      Then I should see "Hallo!" within ".feed-holder ul li:first"
      
  @javascript
  Scenario: Creating a user and seeing him in the userlist and the autocompletion
    Given a user exists with login: "dudemeister"
    And I am using the first browser
      And I go to the startpage
      And I am logged in as "dudemeister"
    Given I am using the second browser
      And I go to the startpage
      And I register as "justadded"
      And wait 1 seconds
    Given I am using the first browser
      Then I should see /justadded/ within "#user-list ul.root"
      And I fill in "message" with "Hallo @just"
      Then the message field should contain "Hallo @justadded"
