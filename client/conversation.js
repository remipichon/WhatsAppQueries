Conversation = new Meteor.Collection("conversation");

Template.modalFile.getCurrentConversationName = function() {
  return "Click me"
}


ConversationHelper = function() {}


ConversationHelper.prototype.parseFile = function(options) {
  var filename = options.filename;
  var conversationName = options.conversationName;
  var add = ((typeof options.add === "boolean") ? options.add : true);
  var rows = options.rows;
  var date = {};
  var hours = {};
  var userName = "";
  var isMultiple = false;
  var month = ["jan", "feb", "mar", "apr", "may", "juin", "juil", "aug", "sept", "nov", "dec"];

  var nbRows = rows.length;
  var cpt = 0;
  var names = [];
  var minDate, maxDate;

  _.each(rows, function(row) {
    if (row.length === 0) return;

    var now = new Date();
    var pasD = null;
    var pasM = null;
    var pasH = null;

    //case day is one digits
    if (row.substring(1, 2) === " ") { //case day is one digit
      pasD = 0;
    } else
    //case day is two digits
    if (typeof parseInt(row.substring(1, 2)) === "number") {
      pasD = 1;
    } else {
      isMultiple = true;
    }
    //case month is short enough
    if (row.substring(6 + pasD, 7 + pasD) === " ") {
      pasM = 0;
    } else
    //case month is too long and contains "."
    if (row.substring(6 + pasD, 7 + pasD) === ".") { //case month is cut and has . at the end
      pasM = 1;
    } else {
      isMultiple = true;
    }
    //case hour is one digit
    if (row.substring(10 + pasD + pasM, 11 + pasD + pasM) === ":") { //case hhour is one digit
      pasH = -2;
    }
    if (row.substring(10 + pasD + pasM, 11 + pasD + pasM) !== ":") {
      pasH = -1;
    }

    //is the row a multiple row ?
    if (pasM == null || pasD == null) {
      var content = row;
      isMultiple = false;
      //we use previous metadata
    } else {
      date = {
        day: parseInt(row.substring(0, 2)),
        month: row.substring(2 + pasD, 6 + pasD),
        hour: row.substring(10 + pasM + pasD + pasH, 12 + pasM + pasD + pasH),
        minutes: row.substring(13 + pasM + pasD + pasH, 15 + pasM + pasD + pasH),
      };
      date.ISO = new Date(now.getFullYear(), month.indexOf(date.month), parseInt(date.day), parseInt(date.hour), parseInt(date.minutes), 0, 0);
      hours = {
        hour: date.hour,
        minutes: date.minutes,
      }
      hours.ISO = new Date(1970, 1, 1, parseInt(date.hour), parseInt(date.minutes), 0, 0);
      var header = row.split(":")[0] + row.split(":")[1];
      userName = row.substring(18 + pasM + pasD + pasH, header.length + 1);
      var content = row.substring(header.length + 3, row.length);
    }

    Data.insert({
      date: date,
      hours: hours,
      userName: userName,
      content: content.length,
      reference: conversationName
    });

    if (names.indexOf(userName) === -1) {
      names.push(userName);
    }

    if (cpt === 0) {
      minDate = date;
    }
    maxDate = date;


    cpt++;
    var toDisplay = null;
    if (cpt > 100) {
      if (cpt > 1000) {
        if (cpt > 10000) {
          if (cpt % 10000 == 0) toDisplay = cpt
        }
        if (cpt % 1000 == 0) toDisplay = cpt
      }
      if (cpt % 100 == 0) toDisplay = cpt
    } else {
      toDisplay = cpt;
    }


    if (toDisplay !== null) {
      log.info("parseFile", filename, toDisplay, "on", nbRows,row);
      //update bootstrap progress bar
      if (Meteor.isClient) {
        var toPrint = parseInt(toDisplay / nbRows * 100) + "%";
        $("#parse-file-progress-bar").css("width", toPrint);
        $("#parse-file-progress-bar span").html(toPrint);
      }
    }
  });

  log.info("parseFile", cpt, "from", filename, "into", conversationName);

  this.create(conversationName, names, minDate, maxDate, nbRows);
  var st = new StatistiqueService({
    ref: conversationName,
    calculAll: false
  });
  st.create();

}


ConversationHelper.prototype.loadFileFromModal = function(event) {
  $(this).off(event);

  var conv = $("#conversation-name").val() !== "";
  var file = $("#fileToUpload").val() !== "";
  var newConv = $("#new-conversation-name").val() !== "";

  if (!newConv && file || !newConv && !conv || !conv && !file && !newConv) {
    log.error("there is no conversation name");
    $("#modal-file-continue").one("click", loadFileFromModal);
    return;
  }

  if (!file && newConv && !conv) {
    log.error("there is no file to upload");
    $("#modal-file-continue").one("click", loadFileFromModal);
    return;
  }


  if (Meteor.isClient) {
    if (conv) {
      //asked to server
      log.info("loadFromModal : conversation asked to server");
    }
  }


  if (Meteor.isClient) {
    $("#modal-file-continue").attr("disabled", "disabled");
    $("#modal-file-close").attr("disabled", "disabled");
    $("#panel-parse-file-progress-bar").fadeIn(300);
  }


  var file = document.getElementById('fileToUpload').files[0];
  if (file) {
    // create reader
    var reader = new FileReader();
    reader.readAsText(file);
    var self = this;
    reader.onload = function(e) {
      log.trace("ConversationHelper.prototype.loadFileFromModal.reader.onload called");
      var content = e.target.result;
      var options = {
          conversationName: $("#new-conversation-name").val(),
          filename: $("#fileToUpload").val(),
          add: true,
          rows: content.split("\n")
        }
        //prep modal
      if (Meteor.isClient) {
        $("#modal-file-continue").attr("disabled", "disabled");
        $("#modal-file-close").attr("disabled", "disabled");
        $("#panel-parse-file-progress-bar").fadeIn(300);
      }
      self.parseFile(options);
      //reset modal
      if (Meteor.isClient) {
        $("#parse-file-progress-bar").css("width", "100%");
        $("#parse-file-progress-bar span").html("Complete");
        $("#modal-file-continue").removeAttr("disabled");
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
    };

    reader.onabort = function() {
      alert("The upload was aborted.");
    };

    reader.onerror = function() {
      alert("An error occured while reading the file.");
    };
  }
}


ConversationHelper.prototype.initAutocompleteConversationName = function() {
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

/**
 * all are mandatories
 * @param  {string} name
 * @param  {array of string} userList
 * @param  {IsoDate} minDate  date of the first row
 * @param  {IsoDate} maxDate  date of the last row
 * @param  {number} nbRows
 */
ConversationHelper.prototype.create = function(name, userList, minDate, maxDate, nbRows) {
  return Conversation.insert({
    name: name,
    userList: userList,
    minDate: minDate,
    maxDate: maxDate,
    nbRows: nbRows
  });
}


Aop.around("", function(f) {
  log.trace(" AOPbefore ConversationHelper." + f.fnName, "called with", ((arguments[0].arguments.length == 0) ? "no args" : arguments[0].arguments));
  var retour = Aop.next(f, ConversationHelper.prototype); //mandatory
  log.trace(" AOPafter ConversationHelper." + f.fnName, "which returned", retour);
  return retour; //mandatory
}, [ConversationHelper.prototype]);