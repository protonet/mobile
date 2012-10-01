//= require "../../data/ext/github.js"

/**
 * GitHub Issue Provider
 */
protonet.text_extensions.provider.GithubIssue = {
  /**
   * Matches
   * http://github.com/protonet/dashboard/issues#issue/7
   * http://github.com/protonet/dashboard/issues/7
   */
  REG_EXP: /github\.com\/(.+?)\/(.+?)\/issues(\#issue)?\/(\d)/i,
  
  loadData: function(url, onSuccess, onFailure) {
    var match = url.match(this.REG_EXP),
        repoOwner = match[1],
        repoName = match[2],
        issueId = match[4];
    
    protonet.data.GitHub.getIssue(repoOwner, repoName, issueId, function(response) {
      var image = response.user.gravatar_id && ("http://www.gravatar.com/avatar/" + response.user.gravatar_id);
      onSuccess({
        title:          response.title,
        titleAppendix:  "author: " + response.user.login + ", status: " + response.state,
        description:    response.body,
        image:          image
      });
    }, onFailure);
  }
};