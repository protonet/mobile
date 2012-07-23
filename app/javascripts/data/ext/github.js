protonet.data.GitHub = (function() {
  var COMMIT_INFO = "https://api.github.com/repos/{user}/{repo}/commits/{id}?callback=?",
      REPO_INFO = "https://api.github.com/repos/{user}/{repo}?callback=?",
      ISSUE_INFO = "https://api.github.com/repos/{user}/{repo}/issues/{id}?callback=?",
      TIMEOUT = 4000;
  
  function getCommit(user, repo, id, onSuccess, onFailure) {
    var apiUrl = COMMIT_INFO
      .replace("{user}", user)
      .replace("{repo}", repo)
      .replace("{id}", id);
    
    _getJson(apiUrl, onSuccess, onFailure);
  }
  
  function getRepository(user, repo, onSuccess, onFailure) {
    var apiUrl = REPO_INFO
      .replace("{user}", user)
      .replace("{repo}", repo);
    
    _getJson(apiUrl, onSuccess, onFailure);
  }
  
  function getIssue(user, repo, id, onSuccess, onFailure) {
    var apiUrl = ISSUE_INFO
      .replace("{user}", user)
      .replace("{repo}", repo)
      .replace("{id}", id);
      
    _getJson(apiUrl, onSuccess, onFailure);
  }
  
  function _getJson(apiUrl, onSuccess, onFailure) {
    $.ajax({
      url: apiUrl,
      cache: true,
      dataType: "jsonp",
      timeout: TIMEOUT,
      success: function(response) {
        var data = response["data"];
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