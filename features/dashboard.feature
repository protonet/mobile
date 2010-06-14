Feature: Using the protonet dashboard
  Background:
    Given I go to the start page

  Scenario: First visit to the start page
    Then I should see "login"

  @javascript
  Scenario: Writing a meep
    Then I fill in "message" with "Hallo!"
    And  I press "submit" within "#message-form"
    Then I should see "Hallo" within "#feed-holder ul li:first"
    
  @javascript
  Scenario: Writing a meep containing a channel name
    Given a channel exists with name: "Cool-Channel"
    Given I go to the start page
    Then I fill in "message" with "Hallo @cool-channel!"
    And  I press "submit" within "#message-form"
    Then I should see "cool-channel" within "#feed-holder ul li:first .reply.channel"
    
  @javascript
  Scenario: Writing a meep containing an username
    Given a user exists with login: "dudemeister"
    Then I fill in "message" with "Hallo @dudemeister!"
    And  I press "submit" within "#message-form"
    Then I should see "dudemeister" within "#feed-holder ul li:first .reply"

  @javascript
  Scenario: Writing a meep containing my username
    Given a user exists with login: "dudemeister"
    And I am logged in as "dudemeister"
    And I go to the start page
    And I fill in "message" with "Hallo @dudemeister!"
    And  I press "submit" within "#message-form"
    Then I should see "dudemeister" within "#feed-holder ul li:first .reply.to-me"
    


# Scenario: First visit
#   so you go the start page
#   
#   
#   
# Scenario: inivted to a closed room