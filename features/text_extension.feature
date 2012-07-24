Feature: Use protonets text extensions
  Background:
    Given I go to the start page
    
  @javascript
  Scenario: Writing a meep containing a Link
    When I fill in "message" with "www.google.com "
    Then I should see "Google" within ".text-extension-results .title"
  
  @javascript
  Scenario: send a GoogleMaps Link
    When I fill in "message" with "Protonet Headquarter: https://maps.google.com/maps?q=protonet+hamburg&hl=en&ll=53.557136,9.963012&spn=0.010095,0.024569&sll=34.164908,-118.626251&sspn=0.449973,0.786209&hq=protonet&hnear=Hamburg,+Germany&t=m&z=16 "
    Then I should see "Hamburg, Germany" within ".text-extension-results.Maps .title"
    Then I should see "maps.google.com" within ".text-extension-results.Maps .domain"
    Then I should see "protonet hamburg" within ".text-extension-results.Maps .description"
    
  @javascript
  Scenario: paste in a FlickrSearch Link
    When I fill in "message" with "Look a these cats: http://www.flickr.com/search/?q=caturday "
    Then I should see "Search results for 'caturday'" within ".text-extension-results.FlickrSearch .title"
    Then I should see "www.flickr.com" within ".text-extension-results.FlickrSearch .domain"
    Then I should see 7 "figure" tags within ".text-extension-results.FlickrSearch .media"
    
  @javascript
  Scenario: paste in a FlickrPhotosetSet Link
    When I fill in "message" with "http://www.flickr.com/photos/arny_johanns/sets/1355696/ "
    Then I should see "Flickr Photo Set" within ".text-extension-results.FlickPhotoSet .title"
    Then I should see "www.flickr.com" within ".text-extension-results.FlickPhotoSet .domain"
    Then I should see 7 "figure" tags within ".text-extension-results.FlickPhotoSet .media"

  @javascript
  Scenario: paste in a GithubCommit Link
    When I fill in "message" with "https://github.com/henningthies/pagerank-test.de/commit/13c7d2d1848c3007e55d5d0e0dd9f5f93d314a0f "
    Then I should see "fix seo" within ".text-extension-results.GithubCommit .title"
    Then I should see "github.com" within ".text-extension-results.GithubCommit .domain"
    Then I should see "Henning Thies, pagerank-test.de" within ".text-extension-results.GithubCommit .description"
    Then I should see 7 "div" tags within ".text-extension-results.GithubCommit .media"
    Then I should see "lib/seo.rb" within ".text-extension-results.GithubCommit .media"
    Then I should see "public/stylesheets/layout.css" within ".text-extension-results.GithubCommit .media"
  
  @javascript
  Scenario: paste in a GithubIssue Link
    When I fill in "message" with "https://github.com/xing/wysihtml5/issues/158 "
    Then I should see "Update calls to stop(), which now takes an increment" within ".text-extension-results.GithubIssue .title"
    Then I should see "github.com" within ".text-extension-results.GithubIssue .domain"
    Then I should see "Update calls to stop(), which now takes an increment" within ".text-extension-results.GithubIssue .description"