Feature: Using our user feature
Background:
  Given a user with the login "dudemeister"
  And a user with the login "someotherdude"
  And I go unauthenticated to the start page
  And I am logged in as "dudemeister"
  And I go to the users page

  @javascript
  Scenario: Admin: seeing the general settings
    Given "dudemeister" is an admin
    And I go to the users page
    When I follow "general settings" within "#users-page"
    Then I should see "Logged out users get to see dashboard?" within "#users-details"

  @javascript
  Scenario: Seeing the anonymous users profile
    And I follow "Anonymous" within "#users-page"
    Then I should see "Anonymous" within "#users-details"
    And I should not see "Edit" within "#users-details"
    And I should not see "Admin settings" within "#users-details"
    And I should not see "Password reset" within "#users-details"
    And I should not see "Delete User" within "#users-details"

  @javascript
  Scenario: Seeing some other users profile
    And I follow "someotherdude" within "#users-page"
    Then I should see "someotherdude" within "#users-details"
    And I should not see "Edit" within "#users-details"
    And I should not see "Admin settings" within "#users-details"
    And I should not see "Password reset" within "#users-details"
    And I should not see "Delete User" within "#users-details"

  @javascript
  Scenario: Admin: Managing some other users profile
    And "dudemeister" is an admin
    And I go to the users page
    And I follow "someotherdude" within "#users-page"
    Then I should see "someotherdude" within "#users-details"
    And I should see "Edit" within "#users-details"
    And I should see "Should this user become an Admin" within "#users-details"
    And I should see "Password reset" within "#users-details"
    And I should see "Delete User" within "#users-details"
    # allright now that the basics are done
    # test making an user admin
    And check "admin" within "#admin-setting"
    And I fill in "admin_password" with "123456" within "#admin-setting"
    And press "Update" within "#admin-setting"
    Then I should see "yes" within "#users-details .admin"
    And uncheck "admin" within "#admin-setting"
    And I fill in "admin_password" with "123456" within "#admin-setting"
    And press "Update" within "#admin-setting"
    Then I should see "no" within "#users-details .admin"
    And I fill in "admin_password" with "123456" within "#password-reset"
    And press "Generate New Password" within "#password-reset"
    And I store /"(.*)"/ from ".flash-message p" into "password"
    And I go unauthenticated to the start page
    And I am logged in as "someotherdude"

  @javascript
  Scenario: Seeing my own profile and doing changes
    And I follow "dudemeister" within "#users-page"
    Then I should see "that's you!" within "#users-page li.clicked"
    And I should see "dudemeister" within "#users-details"
    And I should see "Edit" within "#users-details"
    And I should not see "Password reset" within "#users-details"
    Then I fill in "user[login]" with "newname"
    And  I fill in "user[email]" with "some@email.com"
    And  I press "Update" within "#users-details .edit"
    Then I should see "Successfully updated" within ".flash-message"
    And I should see "newname" within "#users-details"
    
  @javascript @wip
  Scenario: Admin: Deleting an user
    Given I go to the users page
    And select an user
    And I have the rights
    Then I should be able to delete the user
    And his tweets should still be visible
    
  @javascript @wip
  Scenario: Admin: Managing stranger rights
    # allowing them to see the dashboard or not
    # allowing strangers to register or not