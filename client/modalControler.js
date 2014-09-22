Template.containerCharts.getCurrentConversationName = function() {
  if (typeof Conversation.findOne({}) === "undefined") {
    return "Feel free to click me !";
  }
  return Conversation.findOne({}).name;
}

ModalControler = function() {
  this.existingConversation = null;
}

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


/**
 * switch validation state of $input.
 * display none all other state
 * @param  {jQuery object} $input input within a form-group with has-feedback
 * @param  {string} state sucess, loading, error
 */
ModalControler.prototype.switchStateInput = function($input, state) {
  var $formGroup = $input.parent(".has-feedback");
  if ($formGroup.length === 0) {
    log.error("ModalControler.prototype.switchStateInput : no form group found");
    return;
  }
  if ($formGroup.data("stateInput") === state) {
    log.debug("ModalControler.prototype.switchStateInput : skipped");
    return;
  }

  $formGroup.removeClass("has-success").removeClass("has-warning").removeClass("has-error");
  $formGroup.children(".sucess-icon").css("display", "none");
  $formGroup.children(".loading-icon").css("display", "none");
  $formGroup.children(".error-icon").css("display", "none");

  switch (state) {
    case "sucess":
      $formGroup.addClass("has-success");
      $formGroup.children(".sucess-icon").css("display", "block");
      break;
    case "loading":
      $formGroup.addClass("has-warning");
      $formGroup.children(".loading-icon").css("display", "block");
      break;
    case "error":
      $formGroup.addClass("has-error");
      $formGroup.children(".error-icon").css("display", "block");
      break;
  }
  $formGroup.data("stateInput", state);
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
    $("#modal-file").one("click", resetModal);
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

          $("#modal-file").one("click", resetModal);
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

ModalControler.prototype.initModal = function() {
  var self = this;
  $("#modal-file-close").on("click", this.resetModal);
  $("#new-conversation-name").on("click", function() {
    log.debug("new on click ");
    $("#conversation-name").val("");
    self.switchStateInput($("#conversation-name"), "rien");
  });
  $("#conversation-name").on("click", function() {
    $("#new-conversation-name").val("");
    self.switchStateInput($("#new-conversation-name"), "rien");
  });
  this.resetModal();

}

ModalControler.prototype.resetModal = function() {
  this.switchStateInput($("#conversation-name"), "rien");
  this.switchStateInput($("#new-conversation-name"), "rien");

  $("#conversation-name").val("");
  $("#new-conversation-name").val("");
  $("#new-conversation-name").off("change");
  $("#new-conversation-name").off("keyup");
  $("#fileToUpload").val("");

  $("#parse-file-progress-bar").css("width", "0%");
  $("#parse-file-progress-bar span").html("0%");
  $("#panel-parse-file-progress-bar").fadeOut(200);
  $("#modal-file-close").removeAttr("disabled");

  $("#modal-file-continue").one("click", ModalControler.prototype.loadFileFromModal);
  $("#modal-file #conversation-name").one("click", ModalControler.prototype.initAutocompleteConversationName);

  $(this).off(event);
  $(this).modal('hide');
  $("#modal-file-continue").one("click", self.loadFileFromModal);

  $("#new-conversation-name").one("click", ModalControler.prototype.initInputNewConversationName);

  $("#modal-file #conversation-name").autocomplete("destroy");
}

ModalControler.prototype.isNameAvailable = function(coll, name) {
  return coll.indexOf(name) !== -1;
}

ModalControler.prototype.stateOfLoadName = function(result) {
  var $input = $("#modal-file #conversation-name");
  if (this.isNameAvailable(result, $input.val())) {
    this.switchStateInput($input, "sucess");
    $("#modal-file-continue").removeAttr("disabled");
  } else {
    this.switchStateInput($input, "error");
    $("#modal-file-continue").attr("disabled", "disabled");
  }

}


ModalControler.prototype.stateOfCreateName = function(result) {
  var $input = $("#modal-file #new-conversation-name");
  if (!this.isNameAvailable(result, $input.val()) && $input.val() !== "") {
    this.switchStateInput($input, "sucess");
    $("#modal-file-continue").removeAttr("disabled");
  } else {
    this.switchStateInput($input, "error");
    $("#modal-file-continue").attr("disabled", "disabled");
  }

}


ModalControler.prototype.initAutocompleteConversationName = function() {
  this.switchStateInput($("#modal-file #conversation-name"), "loading");
  var self = this;
  $("#modal-file #conversation-name").removeAttr("disabled");
  Meteor.call("getExistingConversationName", function(error, result) {
    if (typeof error !== "undefined") {
      log.error("getExistingConversationName :", error);
      self.switchStateInput($("#modal-file #conversation-name"), "error");
      $("#modal-file #conversation-name").attr("disabled", "disabled");
      throw new Meteor.Error("400", "getExistingConversationName", error);
    }
    self.switchStateInput($("#modal-file #conversation-name"), "rien");
    log.info("getExistingConversationName init autocompelte with", result);
    // var resultForAutoComp = result.pop(""); //"" pose des soucis à jQuery.ui.autocomplete
    $("#modal-file #conversation-name").autocomplete({
      source: result,//resultForAutoComp, 
      position: {
        my: "right top",
        at: "right bottom"
      },
     search: function(event, ui) {
        self.stateOfLoadName(result);
      },
      change: function(event, ui) {
        self.stateOfLoadName(result);
      },  //==> pose des soucis lorsqu'on reset le val
      select: function(event, ui) {
        self.stateOfLoadName(result);
      }
    });
  });
}


ModalControler.prototype.initInputNewConversationName = function() {
  var $input = $("#modal-file #new-conversation-name");
  this.switchStateInput($input, "loading");
  var self = this;
  $input.removeAttr("disabled");
  Meteor.call("getExistingConversationName", function(error, result) {
    if (typeof error !== "undefined") {
      log.error("getExistingConversationName :", error);
      self.switchStateInput($("#modal-file #conversation-name"), "error");
      $input.attr("disabled", "disabled");
      throw new Meteor.Error("400", "getExistingConversationName", error);
    }
    self.switchStateInput($input, "rien");
    log.info("initInputNewConversationName init input with", result);
    $input.on("change", function() {
      self.stateOfCreateName(result);
    });
    $input.on("keyup", function() {
      self.stateOfCreateName(result);
    });
  });
}



Aop.around("", function(f) {
  log.trace(" AOPbefore ModalControler." + f.fnName, "called with", ((arguments[0].arguments.length == 0) ? "no args" : arguments[0].arguments));
  var retour = Aop.next(f, ModalControler.prototype); //mandatory
  log.trace(" AOPafter ModalControler." + f.fnName, "which returned", retour);
  return retour; //mandatory
}, [ModalControler.prototype]);