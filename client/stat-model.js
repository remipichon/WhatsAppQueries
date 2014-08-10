Data = new Meteor.Collection("data");


Statistiques = function() {
	this.ref = "sample.txt";
	this.betweenDate = infinityDate();
	this.betweenHours = infinityHours();

	this.enumName = null;
	this.numberMessagePerUser = null;
	this.totalContentPerUser = null;
	this.numberTotalMessage = null;
	this.statNumberMessagePerUser = null;
	this.statContentMessagePerUser = null;

	this.getEnumName = function() {
		if (this.enumName !== null) return this.enumName;
		console.debug("getEnumName avt", this.ref, this.betweenDate);

		var betweenDate = this.betweenDate;
		var ref = this.ref;
		var betweenHours = this.betweenHours;

		console.debug("getEnumName", this.ref, this.betweenDate);

		var names = [];
		_.each(Data.find({
			$and: [{
					reference: this.ref
				},
				betweenDate,
				betweenHours
			],
		}).fetch(), function(row) {

			if (names.indexOf(row.userName) === -1) {
				names.push(row.userName);
			}
		});

		ret = _.sortBy(names, function(name) {
			return name;
		});
		this.enumName = ret;
		return ret;
	};

	this.getNumberMessagePerUser = function() {
		if (this.numberMessagePerUser !== null) return this.numberMessagePerUser;
		var betweenDate = this.betweenDate;
		var ref = this.ref;
		var betweenHours = this.betweenHours;

		var enumName = this.getEnumName();
		var occurences = {};
		_.each(enumName, function(userName) {
			console.debug({
				$and: [{
						userName: userName
					}, {
						reference: ref
					},
					betweenDate,
					betweenHours
				]
			});
			occurences[userName] = Data.find({
				$and: [{
						userName: userName
					}, {
						reference: ref
					},
					betweenDate,
					betweenHours
				]
			}).fetch().length;

		});
		this.numberMessagePerUser = occurences;
		return occurences;
	}

	this.getTotalContentPerUser = function() {
		if (this.totalContentPerUser !== null) return this.totalContentPerUser;
		var betweenDate = this.betweenDate;
		var ref = this.ref;
		var betweenHours = this.betweenHours;
		console.debug("getTotalContentPerUser", this);

		var enumName = this.getEnumName();
		var occurences = {};
		_.each(enumName, function(userName) {
			var tot = 0;
			_.each(Data.find({
				$and: [{
						userName: userName
					}, {
						reference: ref
					},
					betweenDate,
					betweenHours
				]
			}).fetch(), function(record) {
				tot += record.content.length;
			});

			occurences[userName] = tot;
		});
		this.totalContentPerUser = occurences;
		return occurences;
	}

	this.getNumberTotalMessage = function() {
		if (this.numberTotalMessage !== null) return this.numberTotalMessage
		var betweenDate = this.betweenDate;
		var ref = this.ref;
		var betweenHours = this.betweenHours;

		var ret = Data.find({
			reference: ref
		}).fetch().length;
		this.numberTotalMessage = ret;
		return ret;
	}

	this.getStatNumberMessagePerUser = function() {
		if (this.statNumberMessagePerUser !== null) return this.statNumberMessagePerUser;
		var betweenDate = this.betweenDate;
		var ref = this.ref;
		var betweenHours = this.betweenHours;


		var occurences = {};
		var enumName = this.getEnumName();
		var nbMsgPerUser = this.getNumberMessagePerUser();
		var totalMessage = this.getNumberTotalMessage();
		console.debug("getStatNumberMessagePerUser", nbMsgPerUser, totalMessage);
		_.each(enumName, function(name) {
			occurences[name] = nbMsgPerUser[name] / totalMessage;
		});
		this.statNumberMessagePerUser = occurences;
		return occurences;
	}

	this.getStatContentMessagePerUser = function() {
		if (this.statContentMessagePerUser !== null) return this.statContentMessagePerUser;
		var betweenDate = this.betweenDate;
		var ref = this.ref;
		var betweenHours = this.betweenHours;

		var occurences = {};
		var enumName = this.getEnumName();
		var contentPerUser = this.getTotalContentPerUser();
		var totalMessageContent = 0;
		_.each(contentPerUser, function(l) {
			totalMessageContent += l;
		});
		_.each(enumName, function(name) {
			occurences[name] = contentPerUser[name] / totalMessageContent;
		});
		this.statContentMessagePerUser = occurences;
		return occurences;
	}

	this.printStat = function() {

		console.info("user ", this.getEnumName());
		console.info("number message per user ", this.getNumberMessagePerUser());
		console.info("total content per user ", this.getTotalContentPerUser());
		console.info("stat number message per user", this.getStatNumberMessagePerUser());
		console.info("stat content message per user ", this.getStatContentMessagePerUser());
	}


	//AOP
	//log input this
	//log output result


}

// var temp = new Statistiques();
// _.each(Object.getOwnPropertyNames(temp), function(property) {
// 	if (typeof temp[property] === "function") {
// 		//AOP
// 		Statistiques[property]
// 		console.infos("TRACE : ")
// 	}
// })

// delete temp;