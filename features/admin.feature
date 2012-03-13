Feature: Administrating a node
Background:
  Given a user with the login "dudemeister"
  And I go unauthenticated to the start page
  And I am logged in as "dudemeister"

  Scenario: Only profile settings if you're no admin
    And I go to the preferences page
    Then I should see "No preferences available. Maybe you don't have admin rights?"

  Scenario: all settings if you're an admin
    Given "dudemeister" is an admin
    And I go to the preferences page
    Then I should see all settings
  
  @javascript
  Scenario: Changing the node's name
    Given "dudemeister" is an admin
    Given I go to the preferences page
    And I follow "Node"
    And I fill in "node_name" with "boombox"
    And I press "Save"
    And I follow "WLAN"
    Then I should see "boombox (protonet-private)"
    And I should see "boombox (protonet-public)"
    When I go unauthenticated to the start page
    Then I should see "Welcome to the protonet of boombox"
    Then I should see page title as "boombox - protonet. it's yours."
  