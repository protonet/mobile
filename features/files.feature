Feature: Using our files feature
Background:
  # Given a user exists with login: "dudemeister"
  # Given a user exists with login: "someotherdude"
  # And I go unauthenticated to the start page
  # And I am logged in as "dudemeister"
  # And I go to the users page

  @javascript @wip
  Scenario: directory listings only if you're allowed to see that channel
    # And "dudemeister" is an admin
    # And I go to the users page
    # And I follow "general settings" within "#users-page"
    # Then I should see "Logged out users get to see dashboard?" within "#users-details"

  @javascript @wip
  Scenario: send file only if you're allowed to see that channel
    # And "dudemeister" is an admin
    # And I go to the users page
    # And I follow "general settings" within "#users-page"
    # Then I should see "Logged out users get to see dashboard?" within "#users-details"
