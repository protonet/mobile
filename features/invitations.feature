Feature: Invitations
  Background:
    Given an admin with the login "dudemeister"

  @javascript
  Scenario: Admin invites someone to a channel
    Given I go unauthenticated to the start page
    And I am logged in as "dudemeister"
    And I follow "invite"
    Then I should see "Invite your awesome buddy!"
    When I fill in "Email" with "friend@protonet.com"
    And I fill in "Message" with "Come join us"
    And I check "home"
    And I press "Send invitation"
    Then I should see "Invitation was successfully created"
    # Invitation mail
    And "friend@protonet.com" should receive an email with subject "Join the Protonet"
    When "friend@protonet.com" opens the email with subject "Join the Protonet"
    Then they should see "dudemeister invited you to the Protonet" in the email body
    And they should see "Come join us" in the email body
    And they should see /\/join\/(.*){10}/ in the email body

  Scenario: Invitee accepts invitation  
    Given an invitation exists with token: "1234567890", email: "friend@protonet.com", channel_ids: "1"
    When I accept the invitation with the token "1234567890"
    Then I should be on the accept invitation page
    And I should see "Get started by signing up"
    When I fill in "user_login" with "friend"
    And I fill in "user_password" with "friendly"
    And I fill in "user_password_confirmation" with "friendly"
    And I press "sign up"
    Then I should see "friend" within "#user-navigation"
    And I should see "You have signed up successfull"
    And I should see "Home" within "#channels"