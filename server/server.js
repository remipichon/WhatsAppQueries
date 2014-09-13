 Meteor.startup(function() {
 	//Data.remove({});

 });

 Data = new Meteor.Collection("data");
 Statistique = new Meteor.Collection("statistique");
 Conversation = new Meteor.Collection("conversation");



 Meteor.publish("data", function() {
 	return Data.find({});
 });

Meteor.publish("statistique",function(){
	return Statistique.find({});
});

//just for debug purpose
Meteor.publish("conversation",function(){
	return Conversation.find({});
});



 Meteor.methods({
 	getExistingConversationName: function(){
 		var names = [];
 		var conv = Conversation.find({},{name:1}).fetch();
 		for(var i = 0; i < conv.length;i++){
 			var row = conv[i];
 			names.push(row.name);
 		}
 		return names;
 	}	

 });