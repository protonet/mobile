Feature: Using the protonet preferences
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
  
  @wip
  Scenario: No update functionality if you're no admin
    Give I am no admin
    And I click "software updates"
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

  @wip
  Scenario: User updates account data
    Given Foo
    And I update email
    And I update username
    # check that the inline hints are enabled, the email field doesn't show it