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
    
  # Scenario: Writing a meep containing a channel name
  #   Given there
  #   Then I fill in "message" with "Hallo @!"

# Scenario: First visit
#   so you go the start page
#   
#   
#   
# Scenario: inivted to a closed room