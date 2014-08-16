Data = new Meteor.Collection("data");

Object.size = function(obj) {
	var size = 0,
		key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};


function _Statistiques() {
	this.ref = "sample";
	this.ref = "spam_libre";
	this.ref = "sample_big";
	this.ref = prompt("converstion name ?");
	console.info("Statistique with ",this.ref);
	this.betweenDate = DatetimePicker.prototype.infinityDate();
	this.betweenHours = DatetimePicker.prototype.infinityHours();

	this.enumName = null;
	this.numberMessagePerUser = null;
	this.totalContentPerUser = null;
	this.numberTotalMessage = null;
	this.statNumberMessagePerUser = null;
	this.statContentMessagePerUser = null;

	this.sorted;

	//ce sort est pourri, implementer un quick sort serait bien mieux !
	//sinon, sort les values puis reconstruire l'object à partir des values => probleme si deux values identiques
	this.sortObject = function(ob) {
		return ob;
		var temp = {};
		var cont = true;
		var nb = Object.size(ob)
		console.debug("Statistiques.sortObject object.length", nb, ob);
		while (nb !== 0) {
			cont = true;
			var min = 10000000;
			var user;
			_.each(ob, function(value, userName) {
				if (value < min) {
					min = value;
					user = userName;
				}
			});
			temp[user] = min;
			delete ob[user];
			nb--;
		}

		this.sorted = temp;
		return temp;
	}

	this.getEnumName = function() {
		if (this.enumName !== null) return this.enumName;

		var betweenDate = this.betweenDate;
		var ref = this.ref;
		var betweenHours = this.betweenHours;


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


		occurences = this.sortObject(occurences);
		this.numberMessagePerUser = occurences;
		return occurences;
	}

	this.getTotalContentPerUser = function() {
		if (this.totalContentPerUser !== null) return this.totalContentPerUser;
		var betweenDate = this.betweenDate;
		var ref = this.ref;
		var betweenHours = this.betweenHours;

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
		occurences = this.sortObject(occurences);
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
		_.each(enumName, function(name) {
			occurences[name] = nbMsgPerUser[name] / totalMessage;
		});
		occurences = this.sortObject(occurences);
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
		occurences = this.sortObject(occurences);
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


	/* AOP, second fly */
	// var old = this.getEnumName;
	// this.getEnumName = function() {
	// 	console.log("BEFORE");
	// 	retour = old.apply(this, arguments);
	// 	console.log("AFTER");
	// 	return retour;
	// }


	/*** AOP ***/
	var arrayProperties = Object.getOwnPropertyNames(this);
	// // var arrayProperties = Object.getOwnPropertyNames(statistique);
	// console.log("un", this, arrayProperties);
	/*for (var id = 0; id < arrayProperties.length; id++) {
		property = arrayProperties[id];
		console.log("deux", id, property, this[property]);
		if (typeof this[property] === "function") {
			// 		//AOP
			var self = this;
						
			console.log("AOP", property);
			// 		console.log("AOP", "closure dedans");
			// 		console.log("AOP", self, this);

			var callee = self[property];
			// console.log("AOP", callee);
			// var retour = callee.call(this);
			this[property] = function() {
				console.info("TRACE : input function:", property, " input:", arguments);
				var retour = callee.apply(this, arguments);
				console.info("TRACE : output return:", retour);
			}
			// this[property] = subsitute;


			// 		this[property] = function() {
			// 			console.info("TRACE : input function:", property, " input:", arguments);
			// 			var retour = callee.apply(this, arguments);
			// 			console.info("TRACE : output function:", property, " input:", arguments);
			// 		}
			// 	}
		}
	}*/
}


/*** AOP **/
Statistiques = function() {
	var statistique = new _Statistiques();
	var arrayProperties = Object.getOwnPropertyNames(statistique);
	for (var id = 0; id < arrayProperties.length; id++) {
		var property = arrayProperties[id];
		if (typeof statistique[property] === "function") {
			(function(statistique, property) {
				console.info("add AOP on", property)
				var old = statistique[property];
				statistique[property] = function() {
					console.log("TRACE : AOPbefore Statistiques."+property,"called with", arguments);
					var retour = old.apply(statistique, arguments);
					console.log("TRACE : AOPafter Statistiques."+property,"which returned", retour);
					return retour;
				}
			})(statistique, property);
		}
	}
	return statistique;
}

