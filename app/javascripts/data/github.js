protonet.data.GitHub = (function() {
  var COMMIT_INFO = "http://github.com/api/v2/json/commits/show/{user}/{repo}/{id}?callback=?",
      REPO_INFO = "http://github.com/api/v2/json/repos/show/{user}/{repo}?callback=?",
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
  
  function _getJson(apiUrl, responseKey, onSuccess, onFailure) {
    $.jsonp({
      url: apiUrl,
      cache: true,
      pageCache: true,
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
    getRepository: getRepository
  };
})();