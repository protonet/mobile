//= require "../../utils/prettify_file_size.js"
//= require "../../utils/prettify_date.js"
//= require "../../utils/escape_for_css_query.js"
//= require "../../media/embed_file.js"
//= require "../confirm.js"

protonet.ui.files.File = (function() {
  var viewer      = protonet.config.user_id,
      viewerPath  = protonet.data.User.getFolder(viewer),
      KEY_ENTER   = 13,
      KEY_ESCAPE  = 27;
  
  return Class.create({
    initialize: function(data, fileList) {
      this.data     = this.prepareData(data);
      this.fileList = fileList;
      this.$element = this.create();
    },

    create: function() {
      var template = this.data.type + "-item-template",
          isViewer = this.data.path === viewerPath;

      var $element = new protonet.utils.Template(template, this.data).to$();
      $element.data("instance", this);
      
      if (this.data.path === viewerPath) {
        var avatar = protonet.data.User.getAvatar(this.data.belongsTo);
        $("<img>", { src: protonet.media.Proxy.getImageUrl(avatar, { width: 16, height: 16 }) }).insertAfter($element.find(".folder"));
      }
      
      if (isViewer) {
        $element.addClass("myself");
      }

      return $element;
    },
    
    reRenderItem: function() {
      var $oldElement = this.$element;
      this.$element = this.create();
      $oldElement.replaceWith(this.$element);
    },
    
    renderInto: function($container) {
      this.$element.appendTo($container);
      protonet.trigger("file.rendered", this.$element);
    },
    
    disable: function() {
      this.$element.find(":input").trigger("blur").attr("disabled", "disabled");
      this.$element.addClass("disabled");
    },
    
    enable: function() {
      this.$element.removeClass("disabled");
      this.$element.find(":input").removeAttr("disabled");
    },
    
    remove: function() {
      this.$element.fadeOut("fast", this.destroy.bind(this));
    },
    
    destroy: function() {
      delete this.data;
      this.$element.remove();
    },
    
    setId: function(id) {
      this.$element.attr("id", id);
    },
    
    mark: function() {
      if (this.fileList) {
        this.fileList.mark(this.$element);
      }
    },
    
    progress: function(percent) {
      if (!this.$progress) {
        this.$progress = $("<i>", { "class": "progress" });
        this.$progress.prependTo(this.$element.find(".file-name a"));
      }
      
      this.$progress.text("(" + percent + " %)");
    },
    
    rename: function() {
      var oldName     = this.data.name,
          oldPath     = this.data.path,
          $fileName   = this.$element.find(".file-name a"),
          $input      = $("<input>", { val: oldName });
          
      this.mark();
      
      function adjustWidth() {
        var $temp = $("<span>", { text: $input.val() }).css("white-space", "no-wrap").insertAfter($input);
        $input.css("width", ($temp.outerWidth() + 15).px());
        $temp.remove();
      }
      
      $input.on({
        keydown: function(event) {
          if (event.keyCode === KEY_ENTER) {
            this._saveRename($input);
            event.preventDefault();
          }
          
          if (event.keyCode === KEY_ESCAPE) {
            this._cancelRename();
            event.preventDefault();
          }
          
          // Make sure that the <input> grows based on its value
          setTimeout(adjustWidth, 0);
          
          event.stopPropagation();
        }.bind(this),
        
        click: false,
        
        dblclick: false,
        
        blur: this._saveRename.bind(this, $input)
      });
      
      $fileName.html($input);
      
      // Select file name without file extension for easy editing
      var selectionStart  = 0,
          selectionEnd    = this.data.name.lastIndexOf(".");
      
      if (selectionEnd === -1 || this.data.type === "folder") {
        selectionEnd = this.data.name.length;
      }
      
      $input.prop({
        selectionStart: selectionStart,
        selectionEnd:   selectionEnd
      }).focus();
      
      adjustWidth();
    },
    
    prepareData: function(data) {
      $.extend(data, {
        url:            protonet.data.File.getUrl(data.path),
        downloadUrl:    protonet.data.File.getDownloadUrl(data.path),
        prettyName:     data.name.truncate(70),
        prettySize:     data.size && protonet.utils.prettifyFileSize(data.size),
        prettyModified: protonet.utils.prettifyDate(data.modified)
      });
      
      
      if (data.rendezvousFolder) {
        var userName = (protonet.data.User.getName(data.rendezvousPartner) || "unknown");
        data.prettyName = protonet.t("SHARED_BETWEEN_YOU_AND_USER", { user_name: userName.truncate(20) });
      }
      
      if (data.uploaded) {
        data.prettyUploaded = protonet.utils.prettifyDate(data.uploaded);
      }

      data.uploaderId   = data.uploader_id || -1;
      data.uploaderName = protonet.data.User.getName(data.uploaderId) || "unknown";

      return data;
    },
    
    // --------------------------------------- PRIVATE --------------------------------------- \\
    _saveRename: function($input) {
      $input.unbind("blur");
      
      var oldName = this.data.name,
          newName = $.trim($input.val());
      
      if (newName === oldName || !newName) {
        this._cancelRename();
        return;
      }
      
      if (this.data.path === "/users/" || this.data.path === "/channels/") {
        protonet.trigger("flash_message.error", protonet.t("FOLDER_CANT_BE_RENAMED_ERROR"));
        this._cancelRename();
        return;
      }
      
      if (protonet.data.File.isUserFolder(this.data.path)) {
        protonet.trigger("flash_message.error", protonet.t("FOLDER_BELONGS_TO_USER_ERROR"));
        this._cancelRename();
        return;
      }
      
      if (protonet.data.File.isChannelFolder(this.data.path)) {
        protonet.trigger("flash_message.error", protonet.t("FOLDER_BELONGS_TO_CHANNEL_ERROR"));
        this._cancelRename();
        return;
      }
      
      if (this.fileList) {
        var exists = (this.data.type === "folder" ? this.fileList.getFolder(newName) : this.fileList.getFile(newName));
        if (exists) {
          protonet.trigger("flash_message.error", protonet.t("FILE_ALREADY_EXISTS", {
            object: protonet.t(this.data.type.toUpperCase()), name: newName
          }));
          this._cancelRename();
          return;
        }
      }
      
      this.disable();
      this._sendRename(newName);
    },
    
    _cancelRename: function() {
      this.$element.find(".file-name a").text(this.data.prettyName);
    },
    
    _sendRename: function(newName) {
      var oldPath     = this.data.path,
          parentPath  = protonet.data.File.getFolder(oldPath),
          newPath     = parentPath + newName + (this.data.type === "folder" ? "/" : "");
      
      protonet.data.File.rename(oldPath, newPath, {
        success:  function() {
          $.extend(this.data, {
            name: newName,
            path: newPath
          });
          
          this.data = this.prepareData(this.data);
          this.reRenderItem();
          this.mark();
        }.bind(this),
        error:    function() {
          this.reRenderItem();
          protonet.trigger("flash_message.error", protonet.t("FILE_RENAME_ERROR"));
        }.bind(this)
      });
    }
  });
})();