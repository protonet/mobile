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
    And I go to the new invitation page
    Then I should see "Invite people"
    When I fill in "invitation_email" with "friend@protonet.com"
    And I click on the element ".invitation-message-link"
    And I fill in "invitation_message" with "Come join us"
    And I check "home"
    And I press "Invite"
    Then I should see "has been successfully sent!"
    # Invitation mail
    And "friend@protonet.com" should receive an email with subject "dudemeister wants you to join his protonet"
    When "friend@protonet.com" opens the email with subject "dudemeister wants you to join his protonet"
    Then they should see "<strong>dudemeister</strong> invited you to his protonet network." in the email body
    And they should see "Come join us" in the email body
    And they should see /\/join\/(.*){10}/ in the email body

  @javascript
  Scenario: Invitee accepts invitation
    Given I invite "friend@protonet.com" to channel "Public" with token "1234567890" as "dudemeister"
    And I go unauthenticated to the start page
    When I accept the invitation with the token "1234567890"
    Then I should see "Create an account. It's free."
    When I fill in "user_login" with "friend"
    When I fill in "user_email" with "friend@protonet.com"
    And I fill in "user_password" with "friendly"
    And I fill in "user_password_confirmation" with "friendly"
    And I press "Sign up"
    Then I should see "friend" within "#my-widget"
    And I should see "You have signed up successfully"
    And I should see "Public" within "#channels"
    And I should not see "Notpublic" within "#channels"
    
  @javascript
  Scenario: Invitee tries to accept an invitation that has already been accepted
    Given I invite "friend@protonet.com" to channel "Home" with token "1122334455" as "dudemeister"
    And somebody accepts the invitation with token "1122334455"
    And I go unauthenticated to the start page
    And I accept the invitation with the token "1122334455"
    Then I should be on the new_user_session page
    And I should see "The invitation token is invalid"
    
  @wip
  Scenario: Send copy of Invitation to Inviter too