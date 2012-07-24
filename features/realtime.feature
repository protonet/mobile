Feature: Using the protonet dashboards multi-user realtime functionalities
  
  @javascript
  Scenario: Writing a meep
    Given a user with the login "dudemeister"
      And a user with the login "batman"
      And a channel exists with name: "cool-channel"
    And I am using the first browser
      And go unauthenticated to the start page
      And I am logged in as "dudemeister"
    #batman
    And I am using the second browser
      And go unauthenticated to the start page
      And I am logged in as "batman"
      And I send the message "Moinsen"
    #dudemeister
    And I am using the first browser
      Then I should see "Moinsen" in the timeline
    # batman
    And I am using the second browser
      Then I should see "Moinsen" in the timeline
    #  And I delete the message "Moinsen"
    #And I am using the first browser
    #  Then I should not see "Moinsen" in the timeline
  
  @javascript
  Scenario: Creating a user and seeing him in the userlist and the autocompletion
    Given a user with the login "dudemeister"
    And I am using the first browser
      And go unauthenticated to the start page
      And I am logged in as "dudemeister"
    Given I am using the second browser
      And go unauthenticated to the start page
      And I register as "just" "added"
    Given I am using the first browser
      Then I should see /just.added/ within "#user-widget ul"
      And I fill in "message" with "Hallo @just"
      Then the message field should contain "Hallo @just.added"
  
  @javascript
  Scenario: Keeping the user list updated
    Given a user with the login "dudemeister"
    And a user with the login "batman"
    # seeing strangers in the user list
    And I am using the first browser
      And go unauthenticated to the start page
      And wait for socket
      Then I should see one stranger online
    # and then he's gone
    Given I am logged in as "dudemeister"
      Then I should see no strangers online
    # another user comes
    Given I am using the second browser
      And go unauthenticated to the start page
      And I am logged in as "batman"
    # and the first one leaves
    Given I am using the first browser
      And I leave the page
    # the second user should now be alone
    Given I am using the second browser
      Then I should not see "dudemeister" online in the user widget
  
  @javascript
  Scenario: Testing xhr streaming
    Given a user with the login "spongebob"
    # seeing strangers in the user list
    And I visit "/?forcexhr=1"
      And wait for socket
      Then I should see one stranger online
      # and then he's gone
    Given I am logged in as "spongebob"
      And I visit "/?forcexhr=1"
      Then I should see no strangers online
