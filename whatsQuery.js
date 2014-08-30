 //deprecated or for future use
 getFile = function(filename, conversationName, add) {
   if (typeof filename === "undefined") {
     throw new Error("parseFile :  filename required");

   }

   var conversationName = conversationName || filename;
   var add = add || false;



   if (!add && Meteor.isServer) {
     Data.remove({
       reference: conversationName
     });
   }

   HTTP.get("http://192.168.1.54:3000/" + filename, function(err, result) {
     var rows = result.content.split("\n");
     if (rows[0] === "<!DOCTYPE html>") {
       log.error("parseFile : file", filename, "was not found");
       return -1;
     }
     var options = {
       conversationName: conversationName,
       filename: filename,
       add: true,
       rows: rows
     }
     parseFile(options);
   });
 }


 parseFile = function(options) {
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

   if (Meteor.isClient) {
     $("#modal-file-continue").attr("disabled", "disabled");
     $("#modal-file-close").attr("disabled", "disabled");
   }

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
       log.info("parseFile", filename, toDisplay, "on", nbRows);
       //update bootstrap progress bar
       if (Meteor.isClient) {
         $("#panel-parse-file-progress-bar").fadeIn(300);
         var toPrint = parseInt(toDisplay / nbRows * 100) + "%";
         $("#parse-file-progress-bar").css("width", toPrint);
         $("#parse-file-progress-bar span").html(toPrint);
       }
     }
   });

   log.info("parseFile", cpt, "from", filename, "into", conversationName);

   if (Meteor.isClient) {
     $("#parse-file-progress-bar").css("width", "100%");
     $("#parse-file-progress-bar span").html("Complete");
     $("#modal-file-continue").removeAttr("disabled");
     $("#modal-file").one("click", function() {
      $( this ).off( event );
       $(this).modal('hide');
       $("#modal-file-continue").one("click", loadFileFromModal);

     });

   }

 }