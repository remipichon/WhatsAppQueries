 Meteor.startup(function() {
 	//Data.remove({});

 });

 Data = new Meteor.Collection("data");

 Meteor.publish("data", function() {
 	return Data.find({});
 });


 Meteor.methods({

 	

 });