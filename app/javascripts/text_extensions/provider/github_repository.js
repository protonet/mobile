//= require "../../data/github.js"

/**
 * GitHub Repository Provider
 */
protonet.text_extensions.provider.GithubRepository = {
  REG_EXP: /github\.com\/([a-z0-9\.\-\_]+)\/([a-z0-9\.\-\_]+)/i,
  
  loadData: function(url, onSuccess, onFailure) {
    var match = url.match(this.REG_EXP),
        repoOwner = match[1],
        repoName = match[2];
    
    protonet.data.GitHub.getRepository(repoOwner, repoName, function(response) {
      onSuccess({
        title:          response.owner + "'s " + response.name,
        titleAppendix:  (response.watchers || 0) + " watchers", 
        description:    response.description,
        image:          protonet.config.base_url + "/img/github_octocat.png"
      });
    }, onFailure);
  }
};