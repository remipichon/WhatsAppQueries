Data = new Meteor.Collection("data");
Statistique = new Meteor.Collection("statistique");
statistique = null; //will store the StatistiqueService currently drawn
DataSubscription = null;
StatistiqueSubscription = null;


Object.size = function(obj) {
	var size = 0,
		key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

/**
 * ref is mandatory !
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function _StatistiqueService(options) {
	if (typeof options.calculAll !== "boolean") calculAll = false;
	else calculAll = options.calculAll;
	this.ref = options.ref || ((typeof Conversation.findOne({}) === "undefined") ? null : Conversation.findOne({}).name);
	if (this.ref === null || this.ref === "") {
		log.error("Statistique : options.ref is mandatory");
		return;
	}
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
	this.fetchedRows = null;

	this.sorted;


	//reset fetchedRows in order to fetch again rows if asked
	this.resetFetchedRows = function() {
		this.fetchedRows = null;
	}

	//ce sort est pourri, implementer un quick sort serait bien mieux !
	//sinon, sort les values puis reconstruire l'object à partir des values => probleme si deux values identiques
	this.sortObject = function(ob) {

		var temp = {};
		var cont = true;
		var nb = Object.size(ob)
		log.debug("StatistiqueService.sortObject object.length", nb, ob);
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

		var names = [];
		if (this.fetchedRows !== null) {
			_.each(this.fetchedRows, function(value, key) {
				names.push(key);
			});
			return names;
		}

		var betweenDate = this.betweenDate;
		var ref = this.ref;
		var betweenHours = this.betweenHours;



		_.each(Data.find({
			$and: [{
					reference: this.ref
				},
				//betweenDate,
				//betweenHours
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

	this.fetchesRows = function() {
		if (this.fetchedRows !== null) return this.fetchedRows;
		var occurences = {};
		var name;
		var cpt = 0;
		_.each(Data.find({
			$and: [{
					reference: this.ref
				},
				//this.betweenDate,
				//this.betweenHours
			]
		}).fetch(), function(row) {
			name = row.userName;
			if (typeof occurences[name] !== "object") {
				occurences[name] = [];
			}
			occurences[name].push(row);
			cpt++;
		});
		this.fetchedRows = occurences;
		this.numberTotalMessage = cpt;
		return occurences;
	}

	this.getNumberMessagePerUser = function(options) {
		var options = options || {};
		if (this.numberMessagePerUser !== null) return this.numberMessagePerUser;
		if (typeof options.toSort === "undefined") toSort = true;
		else toSort = options.toSort;
		if (typeof options.refetch !== "boolean") refetch = false;
		else refetch = options.refetch;

		if (this.fetchedRows !== null && refetch === false) {
			log.warn("get nb msg per user use fetchedRows")
			var fetchedRows = this.fetchedRows;
		} else {
			log.warn("get use db")
			var fetchedRows = null;
		}
		var betweenDate = this.betweenDate;
		var ref = this.ref;
		var betweenHours = this.betweenHours;

		var enumName = this.getEnumName();
		var occurences = {};
		_.each(enumName, function(userName) {

			if (fetchedRows !== null) {
				occurences[userName] = fetchedRows[userName].length;
			} else {
				occurences[userName] = Data.find({
					$and: [{
							userName: userName
						}, {
							reference: ref
						},
						//betweenDate,
						//betweenHours
					]
				}).fetch().length;
			}

		});
		if (toSort === true)
			occurences = this.sortObject(occurences);
		this.numberMessagePerUser = occurences;
		return occurences;
	}

	this.getTotalContentPerUser = function() {
		if (this.totalContentPerUser !== null) return this.totalContentPerUser;
		if (this.fetchedRows !== null) {
			var fetchedRows = this.fetchedRows;
		} else {
			var fetchedRows = null;
		}
		var betweenDate = this.betweenDate;
		var ref = this.ref;
		var betweenHours = this.betweenHours;

		var enumName = this.getEnumName();
		var occurences = {};
		_.each(enumName, function(userName) {
			var tot = 0;


			if (fetchedRows !== null) {
				var userRows = fetchedRows[userName];
			} else {
				var userRows = Data.find({
					$and: [{
							userName: userName
						}, {
							reference: ref
						},
						//betweenDate,
						//betweenHours
					]
				}).fetch();
			}

			_.each(userRows, function(record) {
				tot += ((typeof record.content === "number") ? record.content : record.content.length);
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
		if (this.numberCharacterPerMessagePerUser !== null) return this.numberCharacterPerMessagePerUser;
		this.calculAll();
		return this.numberCharacterPerMessagePerUser;
	}

	this.getMessagePerUserTimeline = function(callback) {
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

			delete this.numberMessagePerUser;
			this.numberMessagePerUser = null; //force recalcul
			numberMessagePerUser = this.getNumberMessagePerUser({
				toSort: false,
				refetch: true
			});

			_.each(this.enumName, function(name) {
				if (typeof messagePerUserTimeline[name] !== "object") {
					messagePerUserTimeline[name] = [];
				}
				messagePerUserTimeline[name].push(numberMessagePerUser[name] || 0);
				total += parseInt(messagePerUserTimeline[name][messagePerUserTimeline[name].length - 1]);
			});
			messagePerUserTimeline.total.push(total);
			log.debug("getMessagePerUserTimeline hour", hours["hours.ISO"].$gte.getHours(), "total", total);
			hours = DatetimePicker.prototype.nextHour(hours);
		}

		//reactivation des logs
		log.setLevel(log.levels.TRACE);

		if (typeof callback === "function") {
			callback.call(this);
		}

		this.messagePerUserTimeline = messagePerUserTimeline;
		return messagePerUserTimeline;
	}

	/**
	 * calcul :
	 * totalContentPerUser
	 * numberCharacterPerMessagePerUser
	 * statNumberMessagePerUser
	 * @return {[type]} [description]
	 */
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
					//betweenDate,
					//betweenHours
				]
			}).fetch();

			//content per user
			var tot = 0;
			_.each(rowsName, function(record) { //for each row (message) of an userName
				tot += ((typeof record.content === "number") ? record.content : record.content.length);
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


	this.setAll = function(callback) {
		this.read();
		log.info("StatistiqueService.setAll : starting ...")
		this.fetchesRows();
		this.getNumberTotalMessage();
		this.getEnumName();
		this.getNumberMessagePerUser();
		this.sortEnumName();
		this.calculAll();
		log.info("StatistiqueService.setAll : end");

		//we only want to store statistique based on the whole data
		//if (this.betweenDate['date.ISO'].$gte == DatetimePicker.prototype.infinityDate()['date.ISO'].$gte &&
		//	this.betweenHours['date.ISO'].$gte == DatetimePicker.prototype.infinityHours()['date.ISO'].$gte) {
		this.update();
		//}

		if (typeof callback === "function") {
			callback.call(this);
		}
	}

	if (calculAll) {
		this.setAll();
	}

	/**
	 * return an object of all attributes
	 * @return {[type]} [description]
	 */
	this.getAttributes = function() {
		var attr = {};
		var arrayProperties = Object.getOwnPropertyNames(this);
		for (var id = 0; id < arrayProperties.length; id++) {
			var property = arrayProperties[id];
			if (typeof this[property] !== "function") {
				attr[property] = this[property];
			}
		}
		delete attr.betweenDate;
		delete attr.betweenHours;
		return attr;
	}

	this.create = function() {
		//if (Conversation.findOne({
		//	name: this.ref
		//}).hasStat === true) {
		//	log.error("A statistique already exists");
		//	return;
		//}
		var dataSt = this.getAttributes();
		return Statistique.insert(
			dataSt
		);
	}

	/**
	 * charge les statistques déjà calculée
	 * @param  {Meteor.collection} collection collection which contains statistques (null if never calculated)
	 */
	this.read = function(callback) {
		return;
		//if (Conversation.findOne({
		//	name: this.ref
		//}).hasStat === false) {
		//	log.warn("StatistiqueService.read : A statistique is not already set : you can't read a not calculated statistique");
		//	return;
		//}
		var dataAttribute = Statistique.findOne({
			ref: this.ref
		});

		var arrayProperties = Object.getOwnPropertyNames(this);
		for (var id = 0; id < arrayProperties.length; id++) {
			var property = arrayProperties[id];
			if (typeof this[property] !== "function") {
				if (typeof dataAttribute[property] === "undefined") {
					log.warn("StatistiqueService.read :", property, "doesn't exist in the database");
					continue;
				}
				this[property] = dataAttribute[property];
			}
		}

		this.betweenDate = DatetimePicker.prototype.infinityDate();
		this.betweenHours = DatetimePicker.prototype.infinityHours();
	}

	/**
	 * update all fields to this.ref conversation's statistique. (server only it if previsouly null)
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	this.update = function(callback) {
		if (Conversation.findOne({
			name: this.ref
		}).hasStat === true) {
			log.warn("StatistiqueService.update : A statistique is already set : you can't udpate an already calculated statistique");
			return;
		}

		var dataSt = this.getAttributes();
		Statistique.update({
			_id: Statistique.findOne({
				ref: this.ref
			})._id
		}, {
			$set: dataSt
		});

		Conversation.update({
			_id: Conversation.findOne({
				name: this.ref
			})._id
		}, {
			$set: {
				hasStat: true
			}
		});
	}
}


/*** AOP by RemiP**/
StatistiqueService = function(options) {
	var options = options || {};
	var initAop = (typeof options.initAop !== "undefined") ? options.initAop : true
		//to match old way
	if (typeof options !== "object") {
		var calculAll = calculAll || false;
	} else {
		var calculAll = (typeof options.calculAll !== "undefined") ? options.calculAll : true;
	}
	var ref = options.ref || Conversation.findOne().name || null;

	var statistique = new _StatistiqueService({
		calculAll: false, //false pour laisser le temps à l'aop d'etre init
		ref: ref
	});
	if (!initAop) {
		if (calculAll) {
			statistique.setAll();
		}
		log.trace("StatistiqueService : skip AOP");
		return statistique
	}
	var arrayProperties = Object.getOwnPropertyNames(statistique);
	for (var id = 0; id < arrayProperties.length; id++) {
		var property = arrayProperties[id];
		if (typeof statistique[property] === "function") {
			(function(statistique, property) {
				log.info("add AOP on", property)
				var old = statistique[property];
				statistique[property] = function() {
					log.trace(" AOPbefore StatistiqueService." + property, "called with", arguments);
					var retour = old.apply(statistique, arguments);
					log.trace("AOPafter StatistiqueService." + property, "which returned", retour);
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