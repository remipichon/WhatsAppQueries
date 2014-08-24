Data = new Meteor.Collection("data");

Object.size = function(obj) {
	var size = 0,
		key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};


function _Statistiques(calculAll) {
	var calculAll = calculAll || false;
	this.ref = "sample";
	this.ref = "spam_libre";
	this.ref = "sample_big";
	this.ref = prompt("converstion name ?");
	log.info("Statistique with ", this.ref);
	this.betweenDate = DatetimePicker.prototype.infinityDate();
	this.betweenHours = DatetimePicker.prototype.infinityHours();

	this.enumName = null;
	this.numberMessagePerUser = null;
	this.totalContentPerUser = null;
	this.totalMessageContent = null;
	this.numberTotalMessage = null;
	this.statNumberMessagePerUser = null;
	this.statContentMessagePerUser = null;
	this.numberCharacterPerMessagePerUser = null;
	this.messagePerUserTimeline = null;

	this.sorted;

	//ce sort est pourri, implementer un quick sort serait bien mieux !
	//sinon, sort les values puis reconstruire l'object à partir des values => probleme si deux values identiques
	this.sortObject = function(ob) {

		var temp = {};
		var cont = true;
		var nb = Object.size(ob)
		log.debug("Statistiques.sortObject object.length", nb, ob);
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

		this.enumName = names;
		return names;
	};

	this.sortEnumName = function() {
		var names = [];
		_.each(this.numberMessagePerUser, function(value, name) {
			names.push(name);
		});
		this.enumName = names;
		return names;
	};

	this.getNumberMessagePerUser = function(toSort) {
		if (this.numberMessagePerUser !== null) return this.numberMessagePerUser;
		if (typeof toSort === "undefined") toSort = true;
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
		if (toSort === true)
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
		if (this.totalMessageContent === null) {
			var contentPerUser = this.getTotalContentPerUser();
			var totalMessageContent = 0;
			_.each(contentPerUser, function(l) {
				totalMessageContent += l;
			});
		}

		_.each(enumName, function(name) {
			occurences[name] = contentPerUser[name] / totalMessageContent;
		});
		occurences = this.sortObject(occurences);
		this.statContentMessagePerUser = occurences;
		return occurences;
	}

	this.getNumberCharacterPerMessagePerUser = function() {
		return this.numberCharacterPerMessagePerUser;
	}

	this.getMessagePerUserTimeline = function() {
		if (this.messagePerUserTimeline !== null) return this.messagePerUserTimeline;
		var allNames = this.getEnumName();
		var hours = DatetimePicker.prototype.oneHour();
		var numberMessagePerUser;
		var messagePerUserTimeline = {
			total: []
		};
		var total = 0;

		//desactivation des logs
		log.setLevel(log.levels.DEBUG);

		while (hours["hours.ISO"].$gte.getHours() < 23) {
			this.betweenHours = hours;
			total = 0;

			this.numberMessagePerUser = null; //force recalcul
			numberMessagePerUser = this.getNumberMessagePerUser(false);

			_.each(this.enumName, function(name) {
				if (typeof messagePerUserTimeline[name] !== "object") {
					messagePerUserTimeline[name] = [];
				}
				messagePerUserTimeline[name].push(numberMessagePerUser[name] || 0);
				total += parseInt(messagePerUserTimeline[name][messagePerUserTimeline[name].length-1]);
			});
			messagePerUserTimeline.total.push(total);
			log.debug("getMessagePerUserTimeline hour", hours["hours.ISO"].$gte.getHours(),"total",total);
			hours = DatetimePicker.prototype.nextHour(hours);
		}

		//reactivation des logs
		log.setLevel(log.levels.TRACE);

		this.messagePerUserTimeline = messagePerUserTimeline;
		return messagePerUserTimeline;
	}

	this.calculAll = function() {
		var betweenDate = this.betweenDate;
		var ref = this.ref;
		var betweenHours = this.betweenHours;
		var totalContent = 0;
		var totalContentPerUser = {};
		var statNumberMessagePerUser = {};
		var numberCharacterPerMessagePerUser = {};
		var numberMessagePerUser = this.getNumberMessagePerUser();
		var numberTotalMessage = this.getNumberTotalMessage();
		_.each(this.getEnumName(), function(userName) { //for each sorted userName
			var rowsName = Data.find({
				$and: [{
						userName: userName
					}, {
						reference: ref
					},
					betweenDate,
					betweenHours
				]
			}).fetch();

			//content per user
			var tot = 0;
			_.each(rowsName, function(record) { //for each row (message) of an userName
				tot += record.content.length;
			});
			totalContentPerUser[userName] = tot;

			//stat number message per user
			statNumberMessagePerUser[userName] = numberMessagePerUser[userName] / numberTotalMessage;

			//number characters per message per user
			numberCharacterPerMessagePerUser[userName] = totalContentPerUser[userName] / numberMessagePerUser[userName]

		});

		this.numberCharacterPerMessagePerUser = numberCharacterPerMessagePerUser;
		this.totalContentPerUser = totalContentPerUser;
		this.statNumberMessagePerUser = statNumberMessagePerUser;
	}


	this.setAll = function() {
		log.info("Statistiques.setAll : starting ...")
		this.getNumberTotalMessage();
		this.getEnumName();
		this.getNumberMessagePerUser();
		this.sortEnumName();
		this.calculAll();
		log.info("Statistiques.setAll : end")
	}

	if (calculAll) {
		this.setAll();
	}
}


/*** AOP **/
Statistiques = function(calculAll) {
	var calculAll = calculAll || false;
	var statistique = new _Statistiques(false); //false pour laisser le temps à l'aop d'etre init
	var arrayProperties = Object.getOwnPropertyNames(statistique);
	for (var id = 0; id < arrayProperties.length; id++) {
		var property = arrayProperties[id];
		if (typeof statistique[property] === "function") {
			(function(statistique, property) {
				log.info("add AOP on", property)
				var old = statistique[property];
				statistique[property] = function() {
					log.trace( " AOPbefore Statistiques." + property, "called with", arguments);
					//log.trace( : AOPbefore Statistiques." + property, "called with this.hours", this.betweenHours);
					var retour = old.apply(statistique, arguments);
					log.trace( "AOPafter Statistiques." + property, "which returned", retour);
					return retour;
				}
			})(statistique, property);
		}
	}

	if (calculAll) {
		statistique.setAll();
	}

	return statistique;
}