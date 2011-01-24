@wip
Feature: Invitations
  Background:
    Given a user exists with login: "dudemeister"
    Given a user exists with login: "someotherdude"
    And "dudemeister" is an admin

  @javascript
  Scenario: Admin invites someone to a channel
    Given I go unauthenticated to the start page
    And I am logged in as "dudemeister"
    And I follow "invite"
    Then I should see "Invite your awesome buddy!"
    When I fill in "Email" with "proto@friends.com"
    And I fill in "Message" with "Come join us"
    And I check "home"
    And I press "Send invitation"
    Then I should see "Invitation was successfully created"
    # Invitation mail
    And "proto@friends.com" should receive an email with subject "Join the Protonet"
    When "proto@friends.com" opens the email with subject "Join the Protonet"
    Then they should see "dudemeister invited you to the Protonet" in the email body
    And they should see "Come join us" in the email body
    And they should see /\/join\/(.*){10}/ in the email body

  Scenario: Invitee accepts invitation  
    Given there is an invitation with the token "1234567890" and the channel ids "1"
    When I accept the invitation with the token "1234567890"
    Then I should be on the accept invitation page
    And I should see "Get started by signing up"
    When I fill in "user_login" with "helloboy"
    And I fill in "user_password" with "hellogirl"
    And I fill in "user_password_confirmation" with "hellogirl"
    And I press "sign up"
    Then I should see "helloboy" within "#user-navigation"
    And I should see "You have signed up successfull"
    And I should see "Home" within "#channels"