Feature: Using our user feature
Background:
  Given a user with the login "dudemeister"
  And a user with the login "someotherdude"
  And I go unauthenticated to the start page
  And I am logged in as "dudemeister"
  And I go to the users page

  @javascript
  Scenario: Seeing the anonymous users profile
    Then I fill in "users_search_term" with "anonymous" within ".users-page"
    Then I press "Go" within ".users-page"
    Then I should see "@Anonymous" within ".users-page h2"
    Then I should not see "edit" within ".users-page"

  @javascript
  Scenario: Seeing some other users profile
    Then I fill in "users_search_term" with "someotherdude" within ".users-page"
    Then I press "Go" within ".users-page"
    Then I should see "@someotherdude" within ".users-page h2"
    Then I should not see "someotherdude@protonet.com"
    Then I should not see "edit" within ".users-page"

  @javascript
  Scenario: Admin: Managing some other users profile
    Given "dudemeister" is an admin
    Then I visit the profile of "someotherdude"
    Then I should see "@someotherdude" within ".users-page h2"
    And I should not see "admin" within "dl[data-cucumber='roles']"
    And I should see "edit" within ".users-page"
    And I follow "edit"
    Then I should see "Should this user become an admin?" within ".users-page"
    And I should see "Change password" within ".users-page"
    And I should see "Generate new password" within ".users-page"
    And I should see "Delete user" within ".users-page"
    # allright now that the basics are done
    # test making an user admin
    And check "admin" within "form[data-cucumber='admin-settings']"
    And I fill in "admin_password" with "123456" within "form[data-cucumber='admin-settings']"
    And press "Save" within "form[data-cucumber='admin-settings']"
    Then I should see "Successfully made" within ".flash-message"
    Then I visit the profile of "someotherdude"
    Then I should see "admin" within "dl[data-cucumber='roles']"
    And I follow "edit"
    And uncheck "admin" within "form[data-cucumber='admin-settings']"
    And I fill in "admin_password" with "123456" within "form[data-cucumber='admin-settings']"
    And press "Save" within "form[data-cucumber='admin-settings']"
    Then I visit the profile of "someotherdude"
    Then I should not see "admin" within "dl[data-cucumber='roles']"
    And I follow "edit"
    And I fill in "admin_password" with "123456" within "form[data-cucumber='change-password']"
    And press "Generate new password" within "form[data-cucumber='change-password']"
    And I store /"(.*)"/ from ".flash-message p" into "password"
    And I go unauthenticated to the start page
    And I am logged in as "someotherdude"

  @javascript
  Scenario: Seeing my own profile and doing changes
    And I follow "My profile" within "header"
    Then I should see "@dudemeister" within ".users-page h2"
    And I should see "edit" within ".users-page"
    And I follow "edit" within ".users-page"
    And I should not see "Generate new password" within ".users-page"
    Then I fill in "user[login]" with "newname" within "form[data-cucumber='user-details']"
    And  I fill in "user[email]" with "some@email.com" within "form[data-cucumber='user-details']"
    And  I press "Save" within "form[data-cucumber='user-details']"
    Then I should see "Successfully updated" within ".flash-message"
    Then I visit the profile of "newname"
    And I should see "@newname" within ".users-page h2"
    
  @javascript @wip
  Scenario: Admin: Deleting an user
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
