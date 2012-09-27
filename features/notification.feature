Feature: Notify user about unread messages

Background:
  Given a user with the login "online"
  And no emails have been sent
  And a user with the login "offline"
  And go unauthenticated to the start page
  And I am logged in as "online"
  
  @javascript
  Scenario: write a @reply
    When I send the message "moin @offline"
    Then I should see "moin @offline"
    And all jobs are done
    When "offline@protonet.com" opens the email with subject "online mentioned you!"
    Then they should see "moin @offline" in the email body
  
  @javascript
  Scenario: write a private message
    When I start a rendezvous chat with "offline"
    And I send the message "wie geht's @offline?"
    And all jobs are done
    When "offline@protonet.com" opens the email with subject "New message from online!"
    Then they should see "wie geht's @offline?" in the email body
