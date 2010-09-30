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
      
  @javascript
  Scenario: Keeping the user list updated
    Given a user exists with login: "dudemeister"
    And a user exists with login: "batman"
    # seeing strangers in the user list
    And I am using the first browser
      And I go to the startpage
      Then I should see /stranger/ within "#user-list ul.root"
    # and then he's gone
    Given I am logged in as "dudemeister"
      Then I should not see /stranger/ within "#user-list ul.root"
    # another user comes
    Given I am using the second browser
      And I go to the startpage
      And I am logged in as "batman"
    # and the first one leaves
    Given I am using the first browser
      And I leave the page
    # the second user should now be alone
    Given I am using the second browser
      Then I should not see /dudemeister/ within "#user-list ul.root li.online"