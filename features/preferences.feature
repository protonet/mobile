Feature: Using the protonet preferences
  
  @wip
  Scenario: Only profile settings if you're no admin
  
  @wip
  Scenario: all settings if you're an admin
  
  @wip
  Scenario: No update functionality if you're no admin
    Give I am no admin
    And I click on "software updates"
    Then I should not see the any update button
  
  
  @wip
  Scenario: Update functionalities with an update available
    Given I am an admin
    And I click on "software updates"
    And there is a new version available
    Then I should see the update button

  @wip
  Scenario: Update functionalities with no updates available
    Given I am an admin
    And I click on "software updates"
    And there is no new version available
    Then I should see the reinstall button
