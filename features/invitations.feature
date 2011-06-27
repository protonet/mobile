Feature: Invitations
  Background:
    Given strangers are not allowed to register
    And a role exists with title: "user"
    And a role exists with title: "invitee"
    And a channel exists with name: "notpublic"
    And a channel exists with name: "public"
    And a user "dudemeister" exists with login: "dudemeister"
    And "dudemeister" is an admin

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
    And "friend@protonet.com" should receive an email with subject "dudemeister wants you to join the Protonet"
    When "friend@protonet.com" opens the email with subject "dudemeister wants you to join the Protonet"
    Then they should see "dudemeister invited you to the Protonet" in the email body
    And they should see "Come join us" in the email body
    And they should see /\/join\/(.*){10}/ in the email body

  @javascript
  Scenario: Invitee accepts invitation
    Given an invitation exists with token: "1234567890", email: "friend@protonet.com", channel_ids: "3", user: user "dudemeister"
    And I go unauthenticated to the start page
    When I accept the invitation with the token "1234567890"
    Then I should see "Get started by signing up"
    When I fill in "user_login" with "friend"
    When I fill in "user_email" with "friend@protonet.com"
    And I fill in "user_password" with "friendly"
    And I fill in "user_password_confirmation" with "friendly"
    And I press "sign up"
    Then I should see "friend" within ".welcome"
    And I should see "You have signed up successfull"
    And I should see "Public" within "#channels"
    And I should not see "Notpublic" within "#channels"
    
  @javascript
  Scenario: Invitee tries to accept an invitation that has already been accepted
    Given an invitation exists with token: "1122334455", email: "friend@protonet.com", channel_ids: "1", user: user "dudemeister", accepted_at: "2011-01-15 10:00:00"
    And I go unauthenticated to the start page
    When I accept the invitation with the token "1122334455"
    Then I should be on the new_user_session page
    And I should see "The invitation token is invalid"
    
  @wip
  Scenario: Send copy of Invitation to Inviter too