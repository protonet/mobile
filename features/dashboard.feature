Feature: Using the protonet dashboard
  Background:
    Given I go to the start page

  Scenario: First visit to the start page
    Then I should see "login"

  @javascript
  Scenario: Writing a meep
    Then I fill in "message" with "Hallo!"
    And  I press "submit" within "#message-form"
    Then I should see "Hallo" within ".feed-holder ul li:first"

  @javascript
  Scenario: Writing a meep containing a channel name
    Given a channel exists with name: "Cool-Channel"
    Given I go to the start page
    Then I fill in "message" with "Hallo @cool-channel!"
    And  I press "submit" within "#message-form"
    Then I should see "cool-channel" within ".feed-holder ul li:first .reply.channel"

  @javascript
  Scenario: Writing a meep containing an username
    Given a user exists with login: "dudemeister"
    Then I fill in "message" with "Hallo @dudemeister!"
    And  I press "submit" within "#message-form"
    Then I should see "dudemeister" within ".feed-holder ul li:first .reply"

  @javascript
  Scenario: Writing a meep containing my username
    Given a user exists with login: "dudemeister"
    And I am logged in as "dudemeister"
    And I go to the start page
    And I fill in "message" with "Hallo @dudemeister!"
    And  I press "submit" within "#message-form"
    Then I should see "dudemeister" within ".feed-holder ul li:first .reply.to-me"

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

  Scenario: Seeing my subscribed channels
    Given a user exists with login: "dudemeister"
    And a channel exists with name: "cool-channel"
    And "dudemeister" is listening to "cool-channel"
    And I am logged in as "dudemeister"
    Then I should see "Cool-channel" within "#channel"
    
  @javascript
    Scenario: Subscribing to a channel thru a meep mention
    Given a channel exists with name: "cool-channel"
    And a user exists with login: "dudemeister"
    And I am logged in as "dudemeister"
    And I fill in "message" with "@cool-channel"
    And I press "submit" within "#message-form"
    And I click on "cool-channel" within ".feed-holder ul li:first"
    And wait 3 seconds
    Then I should see "Cool-channel" within "#channel"
    