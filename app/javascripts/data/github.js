protonet.data.GitHub = (function() {
  var COMMIT_INFO = "https://github.com/api/v2/json/commits/show/{user}/{repo}/{id}?callback=?",
      REPO_INFO = "https://github.com/api/v2/json/repos/show/{user}/{repo}?callback=?",
      ISSUE_INFO = "https://github.com/api/v2/json/issues/show/{user}/{repo}/{id}?callback=?",
      TIMEOUT = 4000;
  
  function getCommit(user, repo, id, onSuccess, onFailure) {
    var apiUrl = COMMIT_INFO
      .replace("{user}", user)
      .replace("{repo}", repo)
      .replace("{id}", id);
    
    _getJson(apiUrl, "commit", onSuccess, onFailure);
  }
  
  function getRepository(user, repo, onSuccess, onFailure) {
    var apiUrl = REPO_INFO
      .replace("{user}", user)
      .replace("{repo}", repo);
    
    _getJson(apiUrl, "repository", onSuccess, onFailure);
  }
  
  function getIssue(user, repo, id, onSuccess, onFailure) {
    var apiUrl = ISSUE_INFO
      .replace("{user}", user)
      .replace("{repo}", repo)
      .replace("{id}", id);
      
    _getJson(apiUrl, "issue", onSuccess, onFailure);
  }
  
  function _getJson(apiUrl, responseKey, onSuccess, onFailure) {
    $.ajax({
      url: apiUrl,
      cache: true,
      dataType: "jsonp",
      timeout: TIMEOUT,
      success: function(response) {
        var data = response[responseKey];
        if (!data) {
          return onFailure();
        }
        onSuccess(data);
      },
      error: onFailure
    });
  }
  
  return {
    getCommit: getCommit,
    getRepository: getRepository,
    getIssue: getIssue
  };
})();