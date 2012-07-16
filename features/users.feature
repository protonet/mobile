Feature: Using our user feature
Background:
  Given a user with the login "dudemeister"
  And a user with the login "someotherdude"
  And I go unauthenticated to the start page
  And I am logged in as "dudemeister"
  And I go to the users page
  
  @javascript
  Scenario: Seeing some other users profile
    Then I visit the profile of "someotherdude"
    Then I should see "someotherdude" within ".users-page h2"
    Then I should not see "someotherdude@protonet.com"
    Then I should not see "edit" within ".users-page"

  @javascript
  Scenario: Admin: Managing some other users profile
    Given "dudemeister" is an admin
    Then I visit the profile of "someotherdude"
    Then I should see "someotherdude" within ".users-page h2"
    And I should see "edit" within ".users-page"
    And I follow "edit"
    Then I should see "Permissions" within ".users-page"
    And I should see "Reset password" within ".users-page"
    And I should see "Generate new" within ".users-page"
    And I should see "Delete user" within ".users-page"
    # allright now that the basics are done
    # test making an user admin
    And I choose "role-admin" within "form[data-cucumber='admin-settings']"
    And press "Save" within "form[data-cucumber='admin-settings']"
    Then I should see "The user @someotherdude is now an administrator" within ".flash-message"
    Then I visit the profile of "someotherdude"
    And I should see "system" within ".channel-list"
    And I follow "edit"
    And choose "role-user" within "form[data-cucumber='admin-settings']"
    And press "Save" within "form[data-cucumber='admin-settings']"
    Then I visit the profile of "someotherdude"
    And I should not see "system" within ".channel-list"
    And I follow "edit"
    And press "Generate new" within "form[data-cucumber='change-password']"
    And I wait 3 seconds
    And I store /"(.+?)"/ from ".flash-message p" into "password"
    And I go unauthenticated to the start page
    And I am logged in as "someotherdude"
  
  @javascript
  Scenario: Seeing my own profile and doing changes
    And I follow "dudemeister" within ".user-list"
    Then I should see "dudemeister" within ".users-page h2"
    And I should see "edit" within ".users-page"
    And I follow "edit" within ".users-page"
    And I should not see "Generate new password" within ".users-page"
    Then I fill in "user[login]" with "newname" within "form[data-cucumber='user-details']"
    And  I fill in "user[email]" with "some@email.com" within "form[data-cucumber='user-details']"
    And  I press "Save" within "form[data-cucumber='user-details']"
    Then I should see "Successfully updated" within ".flash-message"
    Then I visit the profile of "newname"
    And I should see "newname" within ".users-page h2"
    
  @javascript @wip
  Scenario: Admin Deleting an user
    Given I go to the users page
    And select an user
    And I have the rights
    Then I should be able to delete the user
    And his meeps should still be visible
    
  @javascript @wip
  Scenario: Admin: Managing stranger rights
    # allowing them to see the dashboard or not
    # allowing strangers to register or not
    
  @javascript @wip
  Scenario: Sending out a new password for a user
