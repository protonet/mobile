Feature: Handling authentication and authorization

  Scenario: Reset my password
    Given a user with the login "lazy_dude"
    And I go to the startpage
    And I follow "Reset it here"
    When I fill in "user_login" with "lazy_dude@protonet.com"
    And I press "Reset"
    Then I should see "You will receive an email with instructions about how to reset your password in a few minutes."
    When "lazy_dude@protonet.com" opens the email with subject "Reset your protonet password for localhost:3000"
    And I follow "Change my password" in the email
    And I fill in "user_password" with "secure_password"
    And I fill in "user_password_confirmation" with "secure_password"
    And I press "Change"
    Then I should be logged in as "lazy_dude"
    And I should see "Your password was changed successfully. You are now signed in."