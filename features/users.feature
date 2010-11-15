Feature: Using our user feature
Background:
  Given a user exists with login: "dudemeister"
  Given a user exists with login: "someotherdude"
  And I go unauthenticated to the start page
  And I am logged in as "dudemeister"
  And I go to the users page

  @javascript
  Scenario: Admin: seeing the general settings
    And I follow "general settings" within "#users-page"
    Then I should see "Logged out users get to see dashboard?" within "#users-details"

  @javascript
  Scenario: Seeing the anonymous users profile
    And I follow "Anonymous" within "#users-page"
    Then I should see "Anonymous" within "#users-details"
    And I should not see "Edit" within "#users-details"

  @javascript
  Scenario: Seeing some other users profile
    And I follow "someotherdude" within "#users-page"
    Then I should see "someotherdude" within "#users-details"
    And I should not see "Edit" within "#users-details"

  @javascript
  Scenario: Seeing my own profile
    And I follow "dudemeister" within "#users-page"
    Then I should see "that's you!" within "#users-page li.clicked"
    And I should see "dudemeister" within "#users-details"
    And I should see "Edit" within "#users-details"
    Then I fill in "user[login]" with "newname"
    And  I fill in "user[email]" with "some@email.com"
    And  I press "Update" within "#users-details .edit"
    Then I should see "Successfully updated" within ".flash-message"
    And I should see "newname" within "#users-details"

  @javascript
  Scenario: Seeing my own profile
    And I follow "dudemeister" within "#users-page"
    Then I should see "that's you!" within "#users-page li.clicked"
    And I should see "dudemeister" within "#users-details"
    And I should see "Edit" within "#users-details"
    Then I fill in "user[login]" with "newname"
    And  I fill in "user[email]" with "some@email.com"
    And  I press "Update" within "#users-details .edit"
    Then I should see "Successfully updated" within ".flash-message"
    And I should see "newname" within "#users-details"
