protonet.data.GitHub = (function() {
  var COMMIT_INFO = "http://github.com/api/v2/json/commits/show/{user}/{repo}/{id}?callback=?",
      TIMEOUT = 4000;
  
  function getCommit(user, repo, id, onSuccess, onFailure) {
    var apiUrl = COMMIT_INFO
      .replace("{user}", user)
      .replace("{repo}", repo)
      .replace("{id}", id);
    
    $.jsonp({
      url: apiUrl,
      cache: true,
      pageCache: true,
      timeout: TIMEOUT,
      success: function(response) {
        var commit = response.commit;
        if (!commit) {
          return onFailure(response);
        }
        onSuccess(commit);
      },
      error: onFailure
    });
  }
  
  return {
    getCommit: getCommit
  };
})();