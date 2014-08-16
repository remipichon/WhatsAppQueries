if (Meteor.isClient) {
  Template.hello.greeting = function() {
    return "Welcome to whatsQuery.";
  };

  Template.hello.events({
    'click input': function() {
      // template data, if any, is available in 'this'
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
  });
}



parseFile = function(filename, conversationName, add) {
  if (typeof filename === "undefined") {
    throw new Error("parseFile :  filename required");

  }
  var month = ["jan", "feb", "mar", "apr", "may", "juin", "juil", "aug", "sept", "nov", "dec"];

  var conversationName = conversationName || filename;
  var add = add || false;



  if (!add && Meteor.isServer) {
    Data.remove({
      reference: conversationName
    });
  }

  HTTP.get("http://192.168.1.54:3000/" + filename, function(err, result) {
    //       if ( err !== "undefined") {
    //         console.log("parseFile err : ", err);
    //         return err;  
    //       }
    //following are in the scope of the HTTP.get callback in order to store
    //data between row. Useful when a user send several messages in a row. In this case
    //metadata are not added to the script
    var date = {};
    var hours = {};
    var userName = "";
    var isMultiple = false;

    var cpt = 0;
    _.each(result.content.split("\n"), function(row) {
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
        console.debug("parseFile : row is a multiple row", row);
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

      console.debug(row);
      console.debug(date, userName, content);


      Data.insert({
        date: date,
        hours: hours,
        userName: userName,
        content: content,
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

      if (toDisplay !== null) console.info("parseFile", filename, toDisplay);
    });

    console.info("parseFile", cpt, "from", filename, "into", conversationName);

  });

}