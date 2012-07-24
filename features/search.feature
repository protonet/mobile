Feature: Using the protonet search

  @javascript @wip
  Scenario: Writing a meep and searching for it
    Given a user with the login "dudemeister"
    And I go to the start page
    And I am logged in as "dudemeister"
    Given I send the message "foobar"
    And SolrIndex is ready
    Then I should see "foobar" in the timeline
    And I visit "/search"
    And I fill in "search_term" with "foo"
    Then I should not see "No results found"
    Then I should see "foobar" within "output.content"
    
    