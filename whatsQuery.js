if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to whatsQuery.";
  };

  Template.hello.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}



parseFile =  function(filename, conversationName, add) {
  if(typeof filename === "undefined"){
      console.err("parseFile :  filename required");
      throw new Error("parseFile :  filename required");

    }
  var month = ["jan","feb","mar","apr","may","jun","juil","aug","sept","nov","dec"];

    var conversationName = conversationName || filename;
    var add = add || false;

    console.log("parseFile", filename, conversationName, add);


    if (!add && Meteor.isServer) {
      Data.remove({
        reference: name
      });
    }

    HTTP.get("http://192.168.1.54:3000/"+filename, function(err, result) {
//       if ( err !== "undefined") {
//         console.log("parseFile err : ", err);
//         return err;
//       }

      _.each(result.content.split("\n"), function(row) {
        console.debug("row : ",row);
        if (row.length === 0) return;
        var now = new Date();
        date = {
          day: row.substring(0, 2),
          month: row.substring(3, 7),
          hour: row.substring(11, 13),
          minutes: row.substring(14, 16),
        };
        date.ISO = new Date(now.getFullYear(), month.indexOf(date.month),parseInt(date.day), parseInt(date.hour), parseInt(date.minutes),0, 0);
        var hours = {
          hour: date.hour,
          minutes: date.minutes,
        }
        hours.ISO = new Date(1970, 1,1, parseInt(date.hour), parseInt(date.minutes),0, 0);       


        var header = row.split(":")[0] + row.split(":")[1];
        var userName = row.substring(19, header.length + 1);
        var content = row.substring(header.length + 3, row.length);

        //console.debug(row,"____",header);
        console.debug(date, name,hours);
        console.debug(content);

        Data.insert({
          date: date,
          hours: hours,
          userName: userName,
          content: content,
          reference: conversationName
        });
      });

      console.log("parseFile : ", filename, " has been parsed into ", name, "added : ", add);

    });
  }



