
Data = new Meteor.Collection("data");



ref = "sample.txt";
getEnumName = function(ref,betweenDate) {
	console.debug("getEnumName avt",this.ref,this.betweenDate);

	this.betweenDate = this.betweenDate || infinityDate();
	this.ref = this.ref || ref;

	console.debug("getEnumName",this.ref,this.betweenDate);

	var names = [];
	_.each(Data.find({
		$and: [{
				reference: this.ref
			},
			this.betweenDate,			
		],
	}).fetch(), function(row) {
//		console.debug(row);
		if (names.indexOf(row.userName) === -1) {
			names.push(row.userName);
		}
	});
	
	return _.sortBy(names,function(name){
			return name;
		});
};

getNumberMessagePerUser = function(ref,betweenDate) {
	this.betweenDate = this.betweenDate || infinityDate();
	this.ref = this.ref || ref;

	var enumName = getEnumName(this.ref);
	var occurences = {};
	_.each(enumName, function(userName) {
		occurences[userName] = Data.find({
			$and: [{
					userName: userName
				}, {
					reference: this.ref
				},
				this.betweenDate
			]
		}).fetch().length;

	});
	return occurences;
}

getTotalContentPerUser = function(ref,betweenDate) {
	this.betweenDate = this.betweenDate || infinityDate();
	this.ref = this.ref || ref;

	var enumName = getEnumName(this.ref);
	var occurences = {};
	_.each(enumName, function(userName) {
		var tot = 0;
		_.each(Data.find({
			$and: [{
					userName: userName
				}, {
					reference:this.ref
				},
				this.betweenDate
			]
		}).fetch(), function(record) {
			tot += record.content.length;
		});

		occurences[userName] = tot;
	});
	return occurences;
}

getNumberTotalMessage = function(ref,betweenDate) {
	this.betweenDate = this.betweenDate || infinityDate();
	this.ref = this.ref || ref;

	return Data.find({
		reference: this.ref
	}).fetch().length;
}


statNumberMessagePerUser = function(ref,betweenDate) {
	this.betweenDate = this.betweenDate || infinityDate();
	this.ref = this.ref || ref;

	console.log("statNumberMessagePerUser",this.ref,this.betweenDate);

	var occurences = {};
	var enumName = getEnumName(this.ref);
	var nbMsgPerUser = getNumberMessagePerUser(this.ref);
	var totalMessage = getNumberTotalMessage(this.ref);
	_.each(enumName, function(name) {
		occurences[name] = nbMsgPerUser[name] / totalMessage;
	});
	return occurences;
}

statContentMessagePerUser = function(ref,betweenDate) {
	this.betweenDate = this.betweenDate || infinityDate();
	this.ref = this.ref || ref;

	var occurences = {};
	var enumName = getEnumName(this.ref);
	var contentPerUser = getTotalContentPerUser(this.ref);
	var totalMessageContent = 0;
	_.each(contentPerUser, function(l) {
		totalMessageContent += l;
	});
	_.each(enumName, function(name) {
		occurences[name] = contentPerUser[name] / totalMessageContent;
	});
	return occurences;
}

getStat = function(ref, betweenDate) {

	this.betweenDate = this.betweenDate || infinityDate();
	this.ref = this.ref || ref;

	console.info("user ", getEnumName.call(this));
	console.info("number message per user ", getNumberMessagePerUser.call(this));
	console.info("total content per user ", getTotalContentPerUser.call(this));
	console.info("stat number message per user", statNumberMessagePerUser.call(this));
	console.info("stat content message per user ", statContentMessagePerUser.call(this));
}
