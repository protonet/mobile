Feature: Managing your profile

  Background:
    Given a user with the login "dudemeister"
    And a role exists with title: "admin" 
    And I go unauthenticated to the start page
    And I am logged in as "dudemeister"
    And I go to the users page

  @javascript
  Scenario: Changing my password
    And I follow "dudemeister" within ".user-list"
    And I follow "edit" within ".users-page"
    Then I should see "Change password" within ".users-page"
    
    # failure
    And I fill in "current_password" with "incorrect" within "form[data-cucumber='change-password']"
    And I fill in "password" with "654321" within "form[data-cucumber='change-password']"
    And I press "Save" within "form[data-cucumber='change-password']"
    Then I should see "Current password is invalid." within ".flash-message"
    # success
    And I fill in "current_password" with "123456" within "form[data-cucumber='change-password']"
    And I fill in "password" with "87654321" within "form[data-cucumber='change-password']"
    And I press "Save" within "form[data-cucumber='change-password']"
    Then I should see "successfully changed" within ".flash-message"
    
    # and try it out
    Then I log out
    And I am logged in as "dudemeister" with password "87654321"
    Then I should be logged in as "dudemeister"

  @javascript
  Scenario: Seeing my own profile
    Given I follow "dudemeister" within ".user-list"
    Then I should see "dudemeister" within ".users-page h2"
    # standard image
    Then I should see the profile image "user_picture_r4.png" in my profile details
    Then I follow "edit" within ".users-page"
    Then I should see "Change picture" within ".users-page"
    And I attach "profile_pic.png" to "avatar_file"
    Then I should see the profile image "profile_pic.png" in my profile details
