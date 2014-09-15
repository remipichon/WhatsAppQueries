 Meteor.startup(function() {
 	//Data.remove({});

 });

 Data = new Meteor.Collection("data");
 Statistique = new Meteor.Collection("statistique");
 Conversation = new Meteor.Collection("conversation");



 Meteor.methods({
 	getExistingConversationName: function() {
 		var names = [];
 		var conv = Conversation.find({}, {
 			name: 1
 		}).fetch();
 		for (var i = 0; i < conv.length; i++) {
 			var row = conv[i];
 			names.push(row.name);
 		}
 		return names;
 	},
 	/**
 	 * create subscription for a conversation
 	 * @param  {[type]} conversationName [description]
 	 * @param  {[type]} userId           [description]
 	 * @param  {boolean} prematureSub     when parsing conversation, we publish/subscibre to something that don't already exists
 	 * @return {[type]}                  [description]
 	 */
 	getConversation: function(conversationName,userId,prematureSub) {
 		if(typeof prematureSub !== "boolean") prematureSub = false; 
 		console.log("getConversation called",conversationName,userId,prematureSub);	 

 		//Lorsqu'un user en a fini avec ses données, le server conserve les publish, n'est ce pas une fuite mémoire ?
 		//Si oui, comment detecter qu'un user non connecté en a fini ?

 		if(!prematureSub && typeof Conversation.findOne({name:conversationName}) === "undefined" ){
 			console.log("getConversation : conversationName doesn't exist");
 			throw new Meteor.Error("404","getConversation : conversationName doesn't exist "+conversationName);
 		}

 		Meteor.publish("data_" + conversationName, function(){
 			return Data.find({
 				reference: conversationName
 			});
 		});
 		Meteor.publish("conversation_" + conversationName, function(){
 			return Conversation.find({
 				name: conversationName
 			});
 		});
 		Meteor.publish("statistique_" + conversationName, function(){
 			return Statistique.find({
 				ref: conversationName
 			});
 		});

 	},
 	deleteConversation: function(conversationName,userId) {
 		log.info("deleteConversation",conversationName);
 		Data.remove({
 			reference: conversationName
 		});
 		Statistique.remove({
 			ref: conversationName
 		});
 		Conversation.remove({
 			name: conversationName
 		});
 	},
 	deleteAll: function(userId) {
 		log.info("deleteAll");
 		Data.remove({});
 		Statistique.remove({});
 		Conversation.remove({});
 	}


 });