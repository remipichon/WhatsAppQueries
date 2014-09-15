Template.modalFile.getCurrentConversationName = function() {
  if (typeof Conversation.findOne({}) === "undefined") {
    return "Click me !";
  }
  return
}

ModalControler = function() {}

/**
 * check if input are logically filled
 * @param  {string} conv    conversation name to load
 * @param  {file} file    binary file of the file to parse
 * @param  {string} newConv new uniqueme name for the file to be parsed
 * @return {boolean}         true if modal is fine
 */
ModalControler.prototype._modalRightlyFilled = function(conv, file, newConv) {
  if (!newConv && file || !newConv && !conv || !conv && !file && !newConv) {
    log.error("there is no conversation name");
    $("#modal-file-continue").one("click", ModalControler.prototype.loadFileFromModal);
    return false;
  }

  if (!file && newConv && !conv) {
    log.error("there is no file to upload");
    $("#modal-file-continue").one("click", ModalControler.prototype.loadFileFromModal);
    return false;
  }

  return true;
}


ModalControler.prototype.loadFileFromModal = function(event) {
  $(this).off(event);

  var conv = $("#conversation-name").val() !== "";
  var file = $("#fileToUpload").val() !== "";
  var newConv = $("#new-conversation-name").val() !== "";

  if (!this._modalRightlyFilled(conv, file, newConv)) return;


  if (conv) {
    //asked to server
    var conversationName = $("#conversation-name").val();
    log.info("loadFromModal : conversation asked to server");
    this.resetModal();
    ConversationHelper.prototype.getConversationDataStatistique(conversationName);
    return;
  }

  var conversationName = $("#new-conversation-name").val();
  var self = this;

  $("#modal-file-continue").attr("disabled", "disabled");
  $("#modal-file-close").attr("disabled", "disabled");
  $("#panel-parse-file-progress-bar").fadeIn(300);

  //ask for subscription to add data
  ConversationHelper.prototype.getConversationDataStatistique(conversationName, true, function() {


    //then check if conversationName doesn't already exists
    Meteor.call("getExistingConversationName", function(error, result) {
      if (typeof error !== "undefined") {
        log.error("getExistingConversationName :", error);
        $("#modal-file #conversation-name").attr("disabled", "disabled");
        throw new Meteor.Error("400", "getExistingConversationName", error);
      }
      log.info("loadFileFromModal check conversationName", result);
      if (result.indexOf(conversationName) !== -1) {
        console.log("loadFileFromModal : conversationName already exists");
        throw new Meteor.Error("500", "loadFileFromModal : conversationName already't exists " + conversationName);
      }

      //finally read the file
      var file = document.getElementById('fileToUpload').files[0];
      if (file) {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(e) {
          log.trace("ModalControler.prototype.loadFileFromModal.reader.onload called");
          var content = e.target.result;
          var options = {
            conversationName: conversationName,
            filename: $("#fileToUpload").val(),
            add: true,
            rows: content.split("\n")
          };
          //prep modal
          if (Meteor.isClient) {
            $("#modal-file-continue").attr("disabled", "disabled");
            $("#modal-file-close").attr("disabled", "disabled");
            $("#panel-parse-file-progress-bar").fadeIn(300);
          }

          ConversationHelper.prototype.parseRows(options);

          //finish state
          $("#parse-file-progress-bar").css("width", "100%");
          $("#parse-file-progress-bar span").html("Complete");
          $("#modal-file-continue").removeAttr("disabled");

          self.resetModal();
        };

        reader.onabort = function() {
          alert("The upload was aborted.");
        };

        reader.onerror = function() {
          alert("An error occured while reading the file.");
        };
      }

    });

  });

}


//TODO : pu la merde ce traitement, que faut il faire ? 
ModalControler.prototype.resetModal = function() {
  $("#modal-file").one("click", function() {
    $("#parse-file-progress-bar").css("width", "0%");
    $("#parse-file-progress-bar span").html("0%");
    $("#panel-parse-file-progress-bar").fadeOut(200);
    $("#modal-file-close").removeAttr("disabled");

    $("#new-conversation-name").val("");
    $("#fileToUpload").val("");
    $(this).off(event);
    $(this).modal('hide');
    $("#modal-file-continue").one("click", self.loadFileFromModal);

    $("#modal-file #conversation-name").autocomplete("destroy");
  });

}


ModalControler.prototype.initAutocompleteConversationName = function() {
  // TODO : add loader
  $("#modal-file #conversation-name").removeAttr("disabled");
  Meteor.call("getExistingConversationName", function(error, result) {
    if (typeof error !== "undefined") {
      log.error("getExistingConversationName :", error);
      $("#modal-file #conversation-name").attr("disabled", "disabled");
      throw new Meteor.Error("400", "getExistingConversationName", error);
    }
    log.info("getExistingConversationName init autocompelte with", result);
    $("#modal-file #conversation-name").autocomplete({
      source: result
    });
  });
}



Aop.around("", function(f) {
  log.trace(" AOPbefore ModalControler." + f.fnName, "called with", ((arguments[0].arguments.length == 0) ? "no args" : arguments[0].arguments));
  var retour = Aop.next(f, ModalControler.prototype); //mandatory
  log.trace(" AOPafter ModalControler." + f.fnName, "which returned", retour);
  return retour; //mandatory
}, [ModalControler.prototype]);