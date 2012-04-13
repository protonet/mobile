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
    Then I should see "Invite people to your protonet"
    When I fill in "invitation_first_name" with "my"
    When I fill in "invitation_last_name" with "friend"
    When I fill in "invitation_email" with "friend-3@example.com"
    And I check "home"
    And I check "public"
    And I press "next Step"
    Then I should see "Invitation for friend-3@example.com"
    And I should see "Status: not sent yet"
    And I press "Send invitation"
    Then I should see "The invitation was sent."
    # Invitation mail
    And "friend-3@example.com" should receive an email with subject "dudemeister has invited you to join the protonet of localhost"
    When "friend-3@example.com" opens the email with subject "dudemeister has invited you to join the protonet of localhost"
    Then they should see "<strong>dudemeister</strong> wants to collaborate with you and just set up an account for you." in the email body
    And they should see "Click this link to get started:" in the email body
    And they should see /\/join\/(.*){10}/ in the email body

  @javascript
  Scenario: User accepts invitation
    Given I invite "peter pan" to channel "Public" with token "1234567890" as "dudemeister"
    And I go unauthenticated to the start page
    When I accept the invitation with the token "1234567890"
    Then I should see "You have been invited by dudemeister. Just create an account. It's free"
    And I fill in "user_password" with "friendly"
    And I fill in "user_password_confirmation" with "friendly"
    And I press "Sign up"
    Then I should see "peter.pan" within "#my-widget"
    And I should see "You have signed up successfully"
    And I should see "Public" within "#channels"
    And I should not see "Notpublic" within "#channels"
    And I should see "Channels" within "nav"
    And I should see "Users" within "nav"
    
  @javascript
  Scenario: Invitee accepts invitation
    Given I invite "peter panius" to channel "Public" with constrained rights and token "1a234567" as "dudemeister"
    And I go unauthenticated to the start page
    When I accept the invitation with the token "1a234567"
    Then I should see "You have been invited by dudemeister. Just create an account. It's free"
    And I fill in "user_password" with "friendly"
    And I fill in "user_password_confirmation" with "friendly"
    And I press "Sign up"
    Then I should see "peter.panius" within "#my-widget"
    And I should see "You have signed up successfully"
    And I should see "Public" within "#channels"
    And I should not see "Notpublic" within "#channels"
    And I should not see "Channels" within "nav"
    And I should not see "Users" within "nav"
    And I visit the "Public" channel page
    Then I should not see "Notpublic" within ".channels-show-page"
    
  @javascript
  Scenario: Invitee tries to accept an invitation that has already been accepted
    Given I invite "john pan" to channel "Home" with token "1122334455" as "dudemeister"
    And somebody accepts the invitation with token "1122334455"
    And I go unauthenticated to the start page
    And I accept the invitation with the token "1122334455"
    Then I should be on the new_user_session page
    And I should see "The invitation token is invalid"
    
  @wip
  Scenario: Send copy of Invitation to Inviter too