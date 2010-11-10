Feature: Managing you're profile
Background:
  Given a user exists with login: "dudemeister"
  And I go to the start page
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

  @wip
  @javascript
  Scenario: Seeing my own profile
    Given I follow "your profile" within "#preferences-page"
    Then I should see my user name
    Then I should see my user image
    And I should see the change button
    And I click on the change button
    And I should be able to choose a file and upload it
    Then I should have a new user image

  @wip
  @javascript
  Scenario: Claiming administrator rights
    Given I click on "your profile"
    Given administrator rights have not been claimed
    And I enter the claiming key
    And submit the form
    Then I should be an admin

  @wip
  @javascript
  Scenario: Trying to claim admin rights if they have already be given
    Given I click on "your profile"
    And administrator rights have been claimed
    Then I should not see the form

