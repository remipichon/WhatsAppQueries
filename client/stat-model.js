Data = new Meteor.Collection("data");


Statistiques = function() {
	//Statistiques
	this.ref = "sample.txt";
	//Statistiques
	this.betweenDate = infinityDate();

	this.enumName = null;
	this.numberMessagePerUser = null;
	this.totalContentPerUser = null;
	this.numberTotalMessage = null;
	this.statNumberMessagePerUser = null;
	this.statContentMessagePerUser = null;



	ref = "sample.txt"; //TODO a virer
	//Statistiques.prototype.
	this.getEnumName = function(ref, betweenDate) {
		if(this.enumName !== null) return this.enumName;
		console.debug("getEnumName avt", this.ref, this.betweenDate);

		var betweenDate = this.betweenDate || betweenDate;
		var ref = this.ref || ref;

		console.debug("getEnumName", this.ref, this.betweenDate);

		var names = [];
		_.each(Data.find({
			$and: [{
					reference: this.ref
				},
				this.betweenDate,
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

	//Statistiques.prototype.
	this.getNumberMessagePerUser = function(ref, betweenDate) {
		if(this.numberMessagePerUser !== null) return this.numberMessagePerUser;
		var betweenDate = this.betweenDate || betweenDate
		var ref = this.ref || ref;

		var enumName = this.getEnumName();
		var occurences = {};
		_.each(enumName, function(userName) {
			console.debug({
				$and: [{
						userName: userName
					}, {
						reference: this.ref
					},
					betweenDate
				]
			});
			occurences[userName] = Data.find({
				$and: [{
						userName: userName
					}, {
						reference: this.ref
					},
					betweenDate
				]
			}).fetch().length;

		});
		this.numberMessagePerUser = occurences;
		return occurences;
	}

	//Statistiques.prototype.
	this.getTotalContentPerUser = function(ref, betweenDate) {
		//if(this.totalConTentPeruser !== null) return this.totalContentPerUser;
		var betweenDate = this.betweenDate || betweenDate;
		var ref = this.ref || ref;
		console.debug("getTotalContentPerUser",this);

		var enumName = this.getEnumName();
		var occurences = {};
		_.each(enumName, function(userName) {
			var tot = 0;
			_.each(Data.find({
				$and: [{
						userName: userName
					}, {
						reference: this.ref
					},
					betweenDate
				]
			}).fetch(), function(record) {
				tot += record.content.length;
			});

			occurences[userName] = tot;
		});
		this.totalContentPerUser = occurences;
		return occurences;
	}

	//Statistiques.prototype.
	this.getNumberTotalMessage = function(ref, betweenDate) {
		if(this.numberTotalMessage !== null) return this.numberTotalMessage
		var betweenDate = this.betweenDate || betweenDate;
		var ref = this.ref || ref;

		var ret = Data.find({
			reference: ref
		}).fetch().length;
		this.numberTotalMessage = ret;
		return ret;
	}


	//Statistiques.prototype.
	this.getStatNumberMessagePerUser = function(ref, betweenDate) {
		if(this.statNumberMessagePerUser !== null) return this.statNumberMessagePerUser;
		var betweenDate = this.betweenDate || betweenDate;
		var ref = this.ref || ref;


		var occurences = {};
		var enumName = this.getEnumName();
		var nbMsgPerUser = this.getNumberMessagePerUser();
		var totalMessage = this.getNumberTotalMessage();
		console.debug("getStatNumberMessagePerUser",nbMsgPerUser,totalMessage);
		_.each(enumName, function(name) {
			occurences[name] = nbMsgPerUser[name] / totalMessage;
		});
		this.statNumberMessagePerUser = occurences;
		return occurences;
	}

	//Statistiques.prototype.
	this.getStatContentMessagePerUser = function(ref, betweenDate) {
		if(this.statContentMessagePerUser !== null)return this.statContentMessagePerUser;
		var betweenDate = this.betweenDate || betweenDate;
		var ref = this.ref || ref;

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

	//Statistiques.prototype.
	this.printStat = function(ref, betweenDate) {

		this.betweenDate = this.betweenDate || betweenDate
		var ref = this.ref || ref;

		console.info("user ", this.getEnumName());
		console.info("number message per user ", this.getNumberMessagePerUser());
		console.info("total content per user ", this.getTotalContentPerUser());
		console.info("stat number message per user", this.getStatNumberMessagePerUser());
		console.info("stat content message per user ", this.getStatContentMessagePerUser());
	}

}