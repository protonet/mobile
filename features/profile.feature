Feature: Managing your profile
Background:
  Given a user exists with login: "dudemeister"
  And I go unauthenticated to the start page
  And I am logged in as "dudemeister"
  And I go to the preferences page

  @javascript
  Scenario: Changing my password
    And I follow "your profile" within "#preferences-page"
    Then I should see "Change your password" within "#preferences-details"
    
    # failure
    And I fill in "current_password" with "incorrect" within "#change-password"
    And I fill in "password" with "654321" within "#change-password"
    And I fill in "password_confirmation" with "654321" within "#change-password"
    And I press "change password" within "#change-password"    
    Then I should see "an error changing" within ".flash-message"
    # success
    And I fill in "current_password" with "123456" within "#change-password"
    And I fill in "password" with "654321" within "#change-password"
    And I fill in "password_confirmation" with "654321" within "#change-password"
    And I press "change password" within "#change-password"
    Then I should see "successfully changed" within ".flash-message"
    
    # and try it out
    Then I log out
    And I am logged in as "dudemeister" with "654321"
    Then I should be logged in as "dudemeister"

  @javascript
  Scenario: Seeing my own profile
    Given I follow "your profile" within "#preferences-page"
    Then I should see "Name: dudemeister" within "#preferences-details"
    # standard image
    Then I should see an image with the url "/img/user_picture.png" within "#preferences-details"
    And I should see "change user image" within "#preferences-details"
    And I press "change user image" within "#preferences-details"
    Then I should see "Upload" within "#new_images_avatar"
    And I attach "profile_pic.png" to "images_avatar[image_file]"
    And I press "Upload" within "#new_images_avatar"
    # custom avatars are stored at /images/avatars/*
    Then I should see an image with the url "/images/avatars" within "#preferences-details"

  @javascript
  Scenario: Claiming administrator rights
    Given administrator rights have not been claimed
    And administrator claiming key is "secret"
    And I follow "your profile" within "#preferences-page"
    And I fill in "key" with "secret" within "#admin-request"
    And I press "submit" within "#admin-request"
    Then I should see "you're an ADMIN" within "#preferences-details"

  @javascript
  Scenario: Trying to claim admin rights if they have already be given
    Given administrator rights have been claimed
    And I follow "your profile" within "#preferences-page"
    And wait 1 second
    Then I should not find "#admin-request" on the page