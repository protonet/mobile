//= require "../../data/ext/github.js"

/**
 * GitHub Commits Provider
 */
protonet.text_extensions.provider.GithubCommit = {
  /**
   * Matches
   * https://github.com/protonet/dashboard/commit/8444bd9c8097e87454b0d2d86c7102f2165a20e2
   */
  REG_EXP: /github\.com\/(.+?)\/(.+?)\/commit\/(\w{40})/i,
  
  loadData: function(url, onSuccess, onFailure) {
    var match = url.match(this.REG_EXP),
        repoOwner = match[1],
        repoName = match[2],
        commitId = match[3];
    
    protonet.data.GitHub.getCommit(repoOwner, repoName, commitId, function(response) {
      var titles = [], codes = [], classes = [], links = [];
      
      $.each(["added", "modified", "removed"], function(i, type) {
        $.each(response[type] || [], function(i, file) {
          var fileName = file.filename || file;
          titles.push(fileName);
          links.push(["http://github.com", repoOwner, repoName, "tree", commitId, fileName].join("/"));
          codes.push(file.diff);
          classes.push(type);
        });
      });
      
      onSuccess({
        title:        response.message,
        description:  response.committer.name + " (" + response.committer.login + "), " + repoName,
        code:         codes,
        codeTitle:    titles,
        codeClass:    classes,
        codeLink:     links
      });
    }, onFailure);
  }
};