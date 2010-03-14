//= require "../../../data/github.js"
//= require "../../../utils/convert_to_pretty_date.js"
//= require "../../../utils/escape_html.js"

/**
 * GitHub Commits Provider
 */
protonet.controls.TextExtension.providers.GithubCommits = function(url) {
  this.url = url;
  this.data = {
    url: this.url
  };
};

protonet.controls.TextExtension.providers.GithubCommits.prototype = {
  /**
   * Matches
   * https://github.com/dudemeister/protonet-dashboard/commit/8444bd9c8097e87454b0d2d86c7102f2165a20e2
   */
  REG_EXP: /github\.com\/(.+?)\/(.+?)\/commit\/(\w{40})/i,
  CLASS_NAME: "code",
  
  match: function() {
    console.log(this.REG_EXP.test(this.url));
    return this.REG_EXP.test(this.url);
  },
  
  _extractInfo: function() {
    var match = this.url.match(this.REG_EXP);
    return {
      owner: match[1],
      repo: match[2],
      commit: match[3]
    };
  },
  
  loadData: function(onSuccessCallback, onFailureCallback) {
    var commitInfo = this._extractInfo();
    protonet.data.GitHub.getCommit(
      commitInfo.owner,
      commitInfo.repo,
      commitInfo.commit,
      this._onSuccess.bind(this, onSuccessCallback),
      this._onFailure.bind(this, onFailureCallback)
    );
    
    $.extend(this.data, commitInfo);
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  _onFailure: function(response, onFailureCallback) {
    if (this._canceled) {
      return;
    }
    
    onFailureCallback();
  },
  
  _onSuccess: function(onSuccessCallback, response) {
    if (this._canceled) {
      return;
    }
    
    $.extend(this.data, response);
    onSuccessCallback(this.data);
  },
  
  getDescription: function() {
    var data = this.data,
        committer = data.committer || {},
        date = protonet.utils.convertToPrettyDate(data.committed_date),
        description = committer.name + " (" + committer.login + "), " + data.repo + ", " + date;
    return String(description || "").truncate(200);
  },
  
  getTitle: function() {
    return String(this.data.message || "").truncate(120);
  },
  
  getMedia: function() {
    var container = $("<div />"),
        data = this.data,
        fileUrl = "http://github.com/" + data.owner + "/" + data.repo + "/tree/" + data.tree;
    
    $.each(this.data.added, function(i, file) {
      this._appendEntry(container, file, "added");
    }.bind(this));
    
    $.each(this.data.modified, function(i, file) {
      this._appendEntry(container, file, "modified");
    }.bind(this));
    
    $.each(this.data.removed, function(i, file) {
      this._appendEntry(container, file, "removed");
    }.bind(this));
    
    return container;
  },
  
  _appendEntry: function(container, file, type) {
    var data = this.data;
    var fileUrl = ["http://github.com", data.owner, data.repo, "tree", data.commit, file.filename].join("/");
    
    var linkText = {
      "modified": "(show/hide changes)",
      "added": "(show file)",
      "removed": ""
    }[type];
    
    var strong = $("<strong />", {
      className: type,
      html: protonet.utils.escapeHtml(file.filename)
    }).appendTo(container);
    
    var link = $("<a />", {
      href: fileUrl,
      target: "_blank",
      html: linkText
    }).appendTo(strong);
    
    if (file.diff) {
      var pre = $("<pre />", {
        html: protonet.utils.escapeHtml(file.diff)
      }).hide().appendTo(container);
      
      link.click(function(event) {
        event.preventDefault();
        pre.toggle();
      });
    }
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

