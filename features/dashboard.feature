Feature: Using the protonet dashboard
  Background:
    Given I go to the start page
  
  @javascript
  Scenario: First visit to the start page
    Then I should see the login form

  @javascript
  Scenario: Writing a meep
    Given I send the message "Hallo!"
    Then I should see "Hallo!" in the timeline

  @javascript
  Scenario: Writing a meep containing a channel name
    Given a channel exists with name: "Cool-Channel"
    And I go to the start page
    And I send the message "Hallo @cool-channel!"
    Then I should see "cool-channel" within "#timeline .reply.channel"

  @javascript
  Scenario: Writing a meep containing an username
    Given a user exists with login: "dudemeister"
    And I send the message "Hallo @dudemeister!"
    Then I should see "dudemeister" within "#timeline .reply"

  @javascript
  Scenario: Writing a meep containing my username
    Given a user exists with login: "dudemeister"
    And I am logged in as "dudemeister"
    And I go to the start page
    And I send the message "Hallo @dudemeister!"
    Then I should see "dudemeister" within "#timeline .reply.user.myself"

  @javascript
  Scenario: Writing a meep containing the beginning of a username
    Given a user exists with login: "dudemeister"
    And I go to the start page
    And I fill in "message" with "Hallo @dudemei"
    Then the message field should contain "Hallo @dudemeister"

  @javascript
  Scenario: Writing a meep containing the beginning of a channel name
    Given a channel exists with name: "bambule"
    And I go to the start page
    And I fill in "message" with "Hallo @bam"
    Then the message field should contain "Hallo @bambule"

  @javascript
  Scenario: Writing a meep containing the beginning of a username should take precedence
    And a channel exists with name: "duderino"
    Given a user exists with login: "dudemeister"
    And I go to the start page
    And I fill in "message" with "Hallo @dude"
    Then the message field should contain "Hallo @dudemeister"

  @javascript
  Scenario: Seeing my subscribed channels
    Given a user exists with login: "dudemeister"
    And a channel exists with name: "cool-channel"
    And "dudemeister" is listening to "cool-channel"
    And I am logged in as "dudemeister"
    Then I should see "Cool-channel" within "#channels"
    
  @javascript
    Scenario: Subscribing to a channel thru a meep mention
    Given a channel exists with name: "cool-channel"
    And a user exists with login: "dudemeister"
    And I am logged in as "dudemeister"
    Given I send the message "@cool-channel"
    And I click on "cool-channel" within "#timeline"
    And wait 3 seconds
    Then I should see "Cool-channel" within "#channels"
    