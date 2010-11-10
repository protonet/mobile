Feature: Handling authentication and authorization

  @wip
  @javascript
  Scenario: Accessing the node with auth wall
    Given that the node is setup to not allow anonymous dashboard views
    And I go to the startpage
    Then I should see the login page
    And not see anything else

  @wip
  @javascript
  Scenario: Accessing the node without the auth wall
    Given that the node is setup to allow anonymous dashboard views
    And I go to the startpage
    Then I should see the dashboard
  
  @wip
  @javascript
  Scenario: Foobar
