Feature: Using the protonet search

  @javascript
  Scenario: Writing a meep and searching for it
    Given a user with the login "dudemeister"
    And I go to the start page
    And I am logged in as "dudemeister"
    Given I send the message "foobar"
    Then I should see "foobar" in the timeline
    And I visit "/search"
    And I fill in "search_term" with "foo"
    And I wait 2 seconds
    Then I should see "foobar" within "output.content"
    