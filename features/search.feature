Feature: Using the protonet search

  @javascript
  Scenario: Writing a meep and searching for it
    Given a user exists with login: "dudemeister"
    And I go to the start page
    And I am logged in as "dudemeister"
    And I fill in "message" with "foobar"
    And I press "submit" within "#message-form"
    Then I should see "foobar" in the timeline
    # And I go to the search page
    # And I fill in "search form" with "foo"
    # Then I should see "foobar" in the search results
    