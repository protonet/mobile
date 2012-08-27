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
      
      $.each(response["files"] || [], function(i, file) {
        titles.push(file.filename || file);
        links.push(file.blob_url);
        codes.push(file.patch);
        classes.push(status);
      });
      
      onSuccess({
        title:        response.commit.message,
        description:  response.commit.committer.name + ", " + repoName,
        code:         codes,
        codeTitle:    titles,
        codeClass:    classes,
        codeLink:     links
      });
    }, onFailure);
  }
};