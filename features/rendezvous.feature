Feature: Initiating rendezvous chats

  @javascript
  Scenario: Starting a rendezvous chat
    Given a user with the login "dudemeister"
      And a user with the login "batman"
    And I am using the first browser
      And go unauthenticated to the start page
      And I am logged in as "dudemeister"
    And I am using the second browser
      And go unauthenticated to the start page
      And I am logged in as "batman"
    #batman
    Given I am using the second browser
      And I start a rendezvous chat with "dudemeister"
      Then I should see a channel for "dudemeister"
      And the protonet channel "dudemeister" should be active
      And I send the message "Hallo!"
    #dudemeister
    And I am using the first browser
      Then I should see a channel for "batman"
      And I switch to the channel "batman"
      Then I should see "Hallo!" in the timeline
    #batman
    And I am using the second browser
      And I close the rendezvous channel for "dudemeister"
    #dudemeister
    And I am using the first browser
      And I send the message "Was geht?"
    #batman
    And I am using the second browser
      Then I should see a channel for "dudemeister"
      And I switch to the channel "dudemeister"
      Then I should see "Was geht?" in the timeline
      
      
  @javascript
  Scenario: Starting a rendezvous chat as a stranger
    Given a user with the login "dudemeister"
    And go unauthenticated to the start page
    And I start a rendezvous chat with "dudemeister"
      Then I should see a channel for "dudemeister"
      And the protonet channel "dudemeister" should be active
