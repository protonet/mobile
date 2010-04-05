protonet.controls.TextExtension.config = {
  IMAGE_WIDTH: 93,
  IMAGE_HEIGHT: 67,
  SORTED_PROVIDERS: [
    // sorted by priority
    "LocalImage",
    "YouTube",
    "Maps",
    "Slideshare",
    "Vimeo",
    "Doodle",
    "XING",
    "Flickr",
    "FlickrPhotoSet",
    "FlickrSearch",
    "Twitpic",
    "Metacafe",
    "Break",
    "DailyMotion",
    "CollegeHumor",
    "GithubCommits",
    "Image",
    "Link"
  ]
};

protonet.controls.TextExtension.providers = {};

/**
 * TODO:
 * Add superclasses for similar text extensions (flash-video, image, image set, etc.)
 * there's so much duplicated code right now. whatever. we have other prios.
 */
//= require "providers/link.js"
//= require "providers/image.js"
//= require "providers/youtube.js"
//= require "providers/vimeo.js"
//= require "providers/maps.js"
//= require "providers/slideshare.js"
//= require "providers/doodle.js"
//= require "providers/xing.js"
//= require "providers/twitpic.js"
//= require "providers/flickr.js"
//= require "providers/flickr_photo_set.js"
//= require "providers/flickr_search.js"
//= require "providers/metacafe.js"
//= require "providers/break.js"
//= require "providers/daily_motion.js"
//= require "providers/college_humor.js"
//= require "providers/github_commits.js"
//= require "providers/local_image.js"