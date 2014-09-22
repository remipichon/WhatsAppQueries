 //deprecated or for future use
 getFile = function(filename, conversationName, add) {
   if (typeof filename === "undefined") {
     throw new Error("parseRows :  filename required");

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
       log.error("parseRows : file", filename, "was not found");
       return -1;
     }
     var options = {
       conversationName: conversationName,
       filename: filename,
       add: true,
       rows: rows
     }
     parseRows(options); //WILL NOT WORK
   });
 }


 if (Meteor.isClient) {

   Meteor.startup(function() {

     



     $(document).ready(function() {
       log.setLevel("trace");
       //parce que les trace prennent trop de place dans la console
       log.trace = function() {
         var args = Array.prototype.slice.call(arguments);
         args.unshift("TRACE : ");
         log.info.apply(this, args);
       }
       DatetimePickerService.prototype.initDatePicker();
       DatetimePickerService.prototype.initTimePicker();
       $("#draw-button").on("click", HighchartsService.prototype.initDrawHighcharts);

      ModalControler.prototype.initModal();

       // test.drawHightcharts("sample");
       
       //don't why I have to do this
       $("#filename").css("cursor","pointer");
     });
   })
 }