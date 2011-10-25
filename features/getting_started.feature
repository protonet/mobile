Feature: Getting Started
  
  @javascript
  Scenario: Going through the getting started process with an admin user
    Given I go to the start page
    Then I should see the login form
    And I should see the registration form
    Given I am logged in as "admin" with password "admin"
    Then "admin" should be an admin
    And I should see the getting started box containing 5 steps
    
    # step 1: change password
    Then I follow the getting started "change password" link
    Then I should see the modal window
    Then I should see "@admin" within ".users-page h2"
    And I fill in "current_password" with "admin" within "form[data-cucumber='change-password']"
    And I fill in "password" with "12345" within "form[data-cucumber='change-password']"
    And I fill in "password_confirmation" with "12345" within "form[data-cucumber='change-password']"
    And I press "Save" within "form[data-cucumber='change-password']"
    Then I should see "successfully changed" within ".flash-message"
    
    # step 2: upload avatar
    Then I attach "profile_pic.png" to "avatar_file"
    And I press "Upload photo"
    Then I should see the profile image "profile_pic.png" in my profile details
    Then I close the modal window
    And I should not see the modal window
    
    Then I should see "change password" marked as done in the getting started box
    And I should see "upload avatar" marked as done in the getting started box
    
    # step 3: create channel
    Then I follow the getting started "create channel" link
    Then I should see the modal window
    Then I should see "Create new" within ".channels-page h2"
    And I fill in "channel_name" with "music" within ".channels-page"
    And I press "Create"
    Then I should see "Successfully created" within ".flash-message"
    And I should see "@music" within ".channels-page h2"
    Then I close the modal window
    And I should not see the modal window
    Then I should see "Music" in the channel selector
    And I should see "create channel" marked as done in the getting started box
    
    # step 4: invite user
    Given a user with the login "batman"
    Then I should see "invite user" marked as done in the getting started box
    
    # step 5: write meep
    Then I send the message "Hallo!"
    Then I should not see the getting started box
  
  @javascript
  Scenario: User registers and manually removes getting started box
    Given a user with the login "spongebob"
    And I go to the start page
    And I am logged in as "spongebob"
    And I close the getting started box
    Then I should not see the getting started box
    And I go to the start page
    Then I should not see the getting started box
    
  @javascript
  Scenario: Going through the getting started process with a normal user
    Given a user with the login "hornyboy52"
    Given a channel named "movies"
    And I go to the start page
    And I am logged in as "hornyboy52"
    And I should see the getting started box containing 3 steps
    
    # step 1: upload avatar
    Then I follow the getting started "upload avatar" link
    Then I should see the modal window
    Then I should see "@hornyboy52" within ".users-page h2"
    Then I attach "profile_pic.png" to "avatar_file"
    And I press "Upload photo"
    Then I should see the profile image "profile_pic.png" in my profile details
    Then I close the modal window
    And I should not see the modal window
    And I should see "upload avatar" marked as done in the getting started box
    
    # step 2: listen to channel
    Then I follow the getting started "create-channel" link
    Then I should see the modal window
    Then I follow "Browse channels"
    Then I select the channel "movies" in the channel list
    And press "Subscribe" within ".channels-page"
    And I close the modal window
    
    # step 3: write meep
    Then I send the message "Hallo!"
    Then I should not see the getting started box